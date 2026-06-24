import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueClient, EuroleagueSchemaError } from "../../index";

import shotsFixture from "./__fixtures__/shots.json";

const gamesIndex = {
  data: [
    { gameCode: 1, round: 1, played: true },
    { gameCode: 2, round: 1, played: true }
  ]
};

describe("ShotsService", () => {
  it("builds the Points live-feed URL and normalizes shot rows", async () => {
    const { calls, fetch } = createFetch(shotsFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const shots = await client.shots.getGame({ gameCode: 1, season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/api/Points");
    expect(url.searchParams.get("gamecode")).toBe("1");
    expect(url.searchParams.get("seasoncode")).toBe("E2023");
    expect(shots[0]).toMatchObject({ action: "Two Pointer", points: 2, team: "MAD" });
  });

  it("skips validation when validate is false but still normalizes", async () => {
    const { fetch } = createFetch(shotsFixture);
    const client = new EuroleagueClient({ fetch });

    const shots = await client.shots.getGame({ gameCode: 1, season: 2023, validate: false });

    expect(shots).toHaveLength(2);
    expect(shots[0]).toMatchObject({ coordX: -120, player: "James, Mike" });
  });

  it("aggregates shots across a round", async () => {
    const { calls, fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    const shots = await client.shots.getRound({ round: 1, season: 2023 });

    expect(calls[0]).toContain("/seasons/E2023/games");
    expect(shots).toHaveLength(4);
  });

  it("aggregates shots across a season and a season range", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    expect(await client.shots.getSeason({ season: 2023 })).toHaveLength(4);
    expect(await client.shots.getSeasons({ from: 2022, to: 2023 })).toHaveLength(8);
  });

  it("throws EuroleagueSchemaError on invalid rows when validating", async () => {
    const { fetch } = createFetch({ Rows: [123] });
    const client = new EuroleagueClient({ fetch });

    await expect(client.shots.getGame({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.shots.getGame({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
  });
});

function createFetch(payload: unknown): { calls: string[]; fetch: typeof globalThis.fetch } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    calls.push(String(input));

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}

function createRouter(): { calls: string[]; fetch: typeof globalThis.fetch } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    const url = String(input);
    calls.push(url);
    const payload = url.includes("live.euroleague.net/api/") ? shotsFixture : gamesIndex;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}
