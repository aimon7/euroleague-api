import { afterEach, describe, expect, it, vi } from "vitest";

import { mapWithConcurrency, RequestPacer } from "./pacing";

describe("RequestPacer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lets the first request through immediately", async () => {
    vi.useFakeTimers();
    const pacer = new RequestPacer(250);

    let acquired = false;
    void pacer.acquire().then(() => {
      acquired = true;
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(acquired).toBe(true);
  });

  it("spaces subsequent requests by the minimum interval", async () => {
    vi.useFakeTimers();
    const pacer = new RequestPacer(250);
    const acquired: number[] = [];

    for (let i = 0; i < 3; i += 1) {
      void pacer.acquire().then(() => acquired.push(i));
    }

    await vi.advanceTimersByTimeAsync(0);
    expect(acquired).toEqual([0]);

    await vi.advanceTimersByTimeAsync(250);
    expect(acquired).toEqual([0, 1]);

    await vi.advanceTimersByTimeAsync(250);
    expect(acquired).toEqual([0, 1, 2]);
  });

  it("does not delay requests that arrive after the interval has already passed", async () => {
    vi.useFakeTimers();
    const pacer = new RequestPacer(250);

    await pacer.acquire();
    await vi.advanceTimersByTimeAsync(1000);

    let acquired = false;
    void pacer.acquire().then(() => {
      acquired = true;
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(acquired).toBe(true);
  });

  it("is a no-op when the interval is zero", async () => {
    vi.useFakeTimers();
    const pacer = new RequestPacer(0);

    let acquired = 0;
    void pacer.acquire().then(() => acquired++);
    void pacer.acquire().then(() => acquired++);
    await vi.advanceTimersByTimeAsync(0);

    expect(acquired).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("mapWithConcurrency", () => {
  it("returns an empty array for empty input without invoking the handler", async () => {
    const fn = vi.fn();

    await expect(mapWithConcurrency([], 4, fn)).resolves.toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });

  it("never exceeds the concurrency limit", async () => {
    let active = 0;
    let maxActive = 0;

    const result = await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8], 3, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active -= 1;

      return item * 10;
    });

    expect(maxActive).toBeLessThanOrEqual(3);
    expect(result).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
  });

  it("preserves input order even when items complete out of order", async () => {
    vi.useFakeTimers();

    const delays = [30, 10, 20, 5];
    const pending = mapWithConcurrency(delays, 4, async (delay) => {
      await new Promise((resolve) => setTimeout(resolve, delay));

      return delay;
    });

    await vi.advanceTimersByTimeAsync(30);
    await expect(pending).resolves.toEqual([30, 10, 20, 5]);
    vi.useRealTimers();
  });

  it("rejects with the first error and does not start new work afterwards", async () => {
    const started: number[] = [];
    const failure = new Error("boom");

    const pending = mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (item) => {
      started.push(item);

      if (item === 2) {
        throw failure;
      }

      return item;
    });

    await expect(pending).rejects.toBe(failure);
    // Workers 1 and 2 start; item 2 fails, so at most one more item (picked up
    // by the surviving worker before the failure flag was set) may start.
    expect(started.length).toBeLessThanOrEqual(3);
    expect(started).not.toContain(6);
  });
});
