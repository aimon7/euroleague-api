import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueClient, EuroleagueSchemaError } from "../../index";

import scheduleFixture from "./__fixtures__/schedule.json";

describe("ScheduleService", () => {
  it("builds the season schedule URL and deep-normalizes nested rows", async () => {
    const { calls, fetch } = createFetch(scheduleFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const games = await client.schedule.getSeason({ season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons/E2023/games");
    expect(games[0]).toMatchObject({ gameCode: 1, played: true, round: 1 });
    expect(games[0]?.phaseType).toEqual({ code: "RS" });
    expect(games[0]?.local).toEqual({ club: { name: "Real Madrid", tvCode: "MAD" } });
  });

  it("passes the round number when fetching a single round", async () => {
    const { calls, fetch } = createFetch(scheduleFixture);
    const client = new EuroleagueClient({ competition: "eurocup", fetch });

    await client.schedule.getRound({ round: 7, season: 2022 });

    const url = new URL(calls[0] ?? "");
    expect(url.pathname).toBe("/v2/competitions/U/seasons/U2022/games");
    expect(url.searchParams.get("roundNumber")).toBe("7");
  });

  it("aggregates across a season range", async () => {
    const { calls, fetch } = createFetch(scheduleFixture);
    const client = new EuroleagueClient({ fetch });

    const games = await client.schedule.getSeasons({ from: 2021, to: 2022 });

    expect(calls).toHaveLength(2);
    expect(games).toHaveLength(4);
  });

  it("throws EuroleagueSchemaError on invalid payloads", async () => {
    const { fetch } = createFetch({ data: ["not-an-object"] });
    const client = new EuroleagueClient({ fetch });

    await expect(client.schedule.getSeason({ season: 2023 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.schedule.getSeason({ season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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
