import { describe, expect, it, vi } from "vitest";

import { BaseResource } from "./base-resource";
import { HttpClient } from "./http-client";

class TestResource extends BaseResource {
  constructor(
    http: HttpClient,
    private readonly codes: number[] = []
  ) {
    super(http);
  }

  protected override async listGameCodes(): Promise<number[]> {
    return this.codes;
  }

  aggregateSeasons(from: number, to: number, loadSeason: (season: number) => Promise<number[]>): Promise<number[]> {
    return this.collectSeasonRange(from, to, loadSeason);
  }

  aggregateRound(loadGame: (season: number, gameCode: number) => Promise<number[]>): Promise<number[]> {
    return this.collectRoundGames(2023, 1, loadGame);
  }
}

function createResource(codes: number[] = []): TestResource {
  return new TestResource(
    new HttpClient({ competition: "euroleague", fetch: vi.fn<typeof globalThis.fetch>() }),
    codes
  );
}

describe("BaseResource aggregation", () => {
  it("flattens large per-season feeds in order without a spread RangeError", async () => {
    const resource = createResource();
    // 200k elements per season exceeds the spread argument-count limit, so the
    // previous `output.push(...feed)` implementation threw a RangeError here.
    const perSeason = 200_000;
    const loadSeason = async (season: number): Promise<number[]> =>
      Array.from({ length: perSeason }, (_, index) => season * perSeason + index);

    const result = await resource.aggregateSeasons(2000, 2001, loadSeason);

    expect(result).toHaveLength(perSeason * 2);
    expect(result[0]).toBe(2000 * perSeason);
    expect(result[perSeason - 1]).toBe(2000 * perSeason + perSeason - 1);
    expect(result[perSeason]).toBe(2001 * perSeason);
    expect(result.at(-1)).toBe(2001 * perSeason + perSeason - 1);
  });

  it("fans out game loads with bounded concurrency", async () => {
    const codes = Array.from({ length: 12 }, (_, index) => index + 1);
    const resource = createResource(codes);
    let active = 0;
    let maxActive = 0;

    await resource.aggregateRound(async (_season, code) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active -= 1;

      return [code];
    });

    expect(maxActive).toBeGreaterThan(1);
    expect(maxActive).toBeLessThanOrEqual(4);
  });

  it("preserves game order even when loads complete out of order", async () => {
    vi.useFakeTimers();
    const codes = [1, 2, 3, 4, 5, 6];
    const resource = createResource(codes);

    const pending = resource.aggregateRound(async (_season, code) => {
      // Later games resolve sooner.
      await new Promise((resolve) => setTimeout(resolve, 100 - code * 10));

      return [code * 100, code * 100 + 1];
    });

    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual([100, 101, 200, 201, 300, 301, 400, 401, 500, 501, 600, 601]);
    vi.useRealTimers();
  });

  it("propagates the first game load failure without starting the remaining games", async () => {
    const codes = Array.from({ length: 20 }, (_, index) => index + 1);
    const resource = createResource(codes);
    const failure = new Error("boom");
    const started: number[] = [];

    const pending = resource.aggregateRound(async (_season, code) => {
      started.push(code);

      if (code === 2) {
        throw failure;
      }

      return [code];
    });

    await expect(pending).rejects.toBe(failure);
    expect(started.length).toBeLessThan(codes.length);
    expect(started).not.toContain(20);
  });
});
