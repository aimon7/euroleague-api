import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueClient, EuroleagueSchemaError } from "../../index";

import standingsFixture from "./__fixtures__/standings.json";

describe("StandingsService", () => {
  it("builds the basic standings URL by default", async () => {
    const { calls, fetch } = createFetch(standingsFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const standings = await client.standings.getRound({ round: 10, season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v3/competitions/E/seasons/E2023/rounds/10/basicstandings"
    );
    expect(standings[0]).toMatchObject({ clubCode: "MAD", gamesWon: 9, position: 1 });
  });

  it("supports each standings type", async () => {
    const { calls, fetch } = createFetch(standingsFixture);
    const client = new EuroleagueClient({ competition: "eurocup", fetch });

    await client.standings.getRound({ round: 5, season: 2022, type: "streaks" });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v3/competitions/U/seasons/U2022/rounds/5/streaks"
    );
  });

  it("throws EuroleagueSchemaError on invalid rows", async () => {
    const { fetch } = createFetch({ teams: [42] });
    const client = new EuroleagueClient({ fetch });

    await expect(client.standings.getRound({ round: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 404 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.standings.getRound({ round: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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
