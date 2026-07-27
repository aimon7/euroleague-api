import { sleep } from "./retry";

/**
 * Enforces a minimum interval between the start of consecutive requests.
 * Slots are handed out in `acquire()` call order; an interval of 0 disables
 * pacing entirely.
 */
export class RequestPacer {
  #nextSlotAt = 0;

  constructor(
    private readonly minIntervalMs: number,
    private readonly now: () => number = Date.now
  ) {}

  async acquire(): Promise<void> {
    if (this.minIntervalMs <= 0) {
      return;
    }

    const current = this.now();
    const slot = Math.max(current, this.#nextSlotAt);
    this.#nextSlotAt = slot + this.minIntervalMs;

    if (slot > current) {
      await sleep(slot - current);
    }
  }
}

/**
 * Maps `items` with at most `limit` handlers in flight, preserving input
 * order in the result. After a failure no new work is started; the promise
 * rejects with the first error encountered (in-flight work is awaited by the
 * caller's runtime but its results are discarded).
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let failed = false;

  async function worker(): Promise<void> {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;

      try {
        results[index] = await fn(items[index] as T, index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
