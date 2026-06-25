import { describe, expect, it, vi } from "vitest";

import { BaseResource } from "./base-resource";
import { HttpClient } from "./http-client";

class TestResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  aggregateSeasons(from: number, to: number, loadSeason: (season: number) => Promise<number[]>): Promise<number[]> {
    return this.collectSeasonRange(from, to, loadSeason);
  }
}

function createResource(): TestResource {
  return new TestResource(new HttpClient({ competition: "euroleague", fetch: vi.fn<typeof globalThis.fetch>() }));
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
});
