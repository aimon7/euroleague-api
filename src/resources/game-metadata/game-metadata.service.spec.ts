import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueClient, EuroleagueSchemaError } from "../../index";

import headerFixture from "./__fixtures__/header.json";

const gamesIndex = {
  data: [
    { gameCode: 1, round: 1, played: true },
    { gameCode: 2, round: 1, played: true }
  ]
};

describe("GameMetadataService", () => {
  it("builds the Header live-feed URL and normalizes the metadata", async () => {
    const { calls, fetch } = createFetch(headerFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const metadata = await client.gameMetadata.getGame({ gameCode: 1, season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/api/Header");
    expect(url.searchParams.get("gamecode")).toBe("1");
    expect(url.searchParams.get("seasoncode")).toBe("E2023");
    expect(metadata).toMatchObject({
      capacity: 15000,
      round: 1,
      scoreA: 80,
      stadium: "WiZink Center",
      teamA: "Real Madrid"
    });
  });

  it("aggregates metadata across a season", async () => {
    const { calls, fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    const metadata = await client.gameMetadata.getSeason({ season: 2023 });

    expect(calls[0]).toContain("/seasons/E2023/games");
    expect(metadata).toHaveLength(2);
  });

  it("aggregates metadata across a round and a season range", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    expect(await client.gameMetadata.getRound({ round: 1, season: 2023 })).toHaveLength(2);
    expect(await client.gameMetadata.getSeasons({ from: 2022, to: 2023 })).toHaveLength(4);
  });

  it("throws EuroleagueSchemaError when the payload is not an object", async () => {
    const { fetch } = createFetch("unexpected");
    const client = new EuroleagueClient({ fetch });

    await expect(client.gameMetadata.getGame({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(
      EuroleagueSchemaError
    );
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 503 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.gameMetadata.getGame({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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
    const payload = url.includes("live.euroleague.net/api/") ? headerFixture : gamesIndex;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}
