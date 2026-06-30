import { describe, expect, it, vi } from "vitest";

import {
  EuroleagueApiError,
  EuroleagueClient,
  EuroleagueSchemaError,
  EuroleagueValidationError,
  type QuarterScoreType
} from "../../index";

import boxscoreFixture from "./__fixtures__/boxscore.json";
import gameRosterFixture from "./__fixtures__/game-roster.json";
import gameStatsFixture from "./__fixtures__/game-stats.json";

const gamesIndex = {
  data: [
    { gameCode: 1, round: 1, played: true },
    { gameCode: 2, round: 1, played: true }
  ]
};

describe("BoxscoreService", () => {
  it("builds the Boxscore live-feed URL and deep-normalizes the full game", async () => {
    const { calls, fetch } = createFetch(boxscoreFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const box = await client.boxscore.getGame({ gameCode: 1, season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/api/Boxscore");
    expect(url.searchParams.get("gamecode")).toBe("1");
    expect(box.referees).toBe("Lottermoser, Javor, Pastusiak");
    expect(Array.isArray(box.byQuarter)).toBe(true);
  });

  it("returns quarter scores rows, defaulting to ByQuarter", async () => {
    const { fetch } = createFetch(boxscoreFixture);
    const client = new EuroleagueClient({ fetch });

    const scores = await client.boxscore.getQuarterScores({ gameCode: 1, season: 2023 });

    expect(scores).toHaveLength(2);
    expect(scores[0]).toMatchObject({ quarter1: 20, team: "Real Madrid" });
  });

  it("supports the EndOfQuarter cumulative type", async () => {
    const { fetch } = createFetch(boxscoreFixture);
    const client = new EuroleagueClient({ fetch });

    const scores = await client.boxscore.getQuarterScores({ gameCode: 1, season: 2023, type: "EndOfQuarter" });

    expect(scores[0]).toMatchObject({ quarter4: 80, team: "Real Madrid" });
  });

  it("flattens player stats from both teams and tags the team", async () => {
    const { fetch } = createFetch(boxscoreFixture);
    const client = new EuroleagueClient({ fetch });

    const players = await client.boxscore.getPlayerStats({ gameCode: 1, season: 2023 });

    expect(players).toHaveLength(3);
    expect(players[0]).toMatchObject({ player: "Tavares, Edy", points: 16, teamName: "Real Madrid" });
    expect(players[2]).toMatchObject({ player: "Vesely, Jan", teamName: "FC Barcelona" });
  });

  it("aggregates player stats across a round", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    const players = await client.boxscore.getPlayerStatsRound({ round: 1, season: 2023 });

    expect(players).toHaveLength(6);
  });

  it("aggregates full game, quarter, and player variants across scopes", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    expect(await client.boxscore.getRound({ round: 1, season: 2023 })).toHaveLength(2);
    expect(await client.boxscore.getSeason({ season: 2023 })).toHaveLength(2);
    expect(await client.boxscore.getSeasons({ from: 2022, to: 2023 })).toHaveLength(4);
    expect(await client.boxscore.getQuarterScoresRound({ round: 1, season: 2023 })).toHaveLength(4);
    expect(await client.boxscore.getQuarterScoresSeason({ season: 2023 })).toHaveLength(4);
    expect(await client.boxscore.getQuarterScoresSeasons({ from: 2022, to: 2023, type: "EndOfQuarter" })).toHaveLength(
      8
    );
    expect(await client.boxscore.getPlayerStatsSeason({ season: 2023 })).toHaveLength(6);
    expect(await client.boxscore.getPlayerStatsSeasons({ from: 2022, to: 2023 })).toHaveLength(12);
  });

  it("builds the v2 stats URL and parses the local/road JSON boxscore", async () => {
    const { calls, fetch } = createFetch(gameStatsFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const stats = await client.boxscore.getGameStats({ gameCode: 1, season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v2/competitions/E/seasons/E2025/games/1/stats"
    );
    expect(stats.local.coach?.name).toBe("KOKOSKOV, IGOR");
    expect(stats.road.coach?.name).toBe("KATTASH, ODED");
    expect(stats.local.total.points).toBe(85);
    expect(stats.local.players).toHaveLength(12);
    expect(stats.local.players[0]?.player.person.name).toBe("BEAUBOIS, RODRIGUE");
    expect(typeof stats.local.players[0]?.stats.startFive).toBe("boolean");
  });

  it("aggregates the v2 JSON boxscore stats across a round", async () => {
    const { calls, fetch } = createStatsRouter();
    const client = new EuroleagueClient({ fetch });

    const stats = await client.boxscore.getRoundStats({ round: 1, season: 2025 });

    const indexCall = new URL(calls[0] ?? "");
    expect(indexCall.pathname).toBe("/v2/competitions/E/seasons/E2025/games");
    expect(indexCall.searchParams.get("roundNumber")).toBe("1");
    expect(stats).toHaveLength(2);
    expect(stats[0]?.road.coach?.name).toBe("KATTASH, ODED");
  });

  it("builds the Players roster feed URL with equipo/temp and parses the roster", async () => {
    const { calls, fetch } = createFetch(gameRosterFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const roster = await client.boxscore.getGameRoster({ clubCode: "IST", gameCode: 1, season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/api/Players");
    expect(url.searchParams.get("equipo")).toBe("IST");
    expect(url.searchParams.get("temp")).toBe("E2025");
    expect(roster).toHaveLength(15);
    expect(roster[0]).toMatchObject({ ac: "P007200", c: "IST", st: 1 });
  });

  it("rejects an invalid clubCode before calling the roster feed", async () => {
    const { calls, fetch } = createFetch(gameRosterFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    await expect(
      client.boxscore.getGameRoster({ clubCode: "../evil", gameCode: 1, season: 2025 })
    ).rejects.toBeInstanceOf(EuroleagueValidationError);
    expect(calls).toHaveLength(0);
  });

  it("validates the quarter score type and rejects an injected feed key", async () => {
    const { calls, fetch } = createFetch(boxscoreFixture);
    const client = new EuroleagueClient({ fetch });

    await expect(
      client.boxscore.getQuarterScores({ gameCode: 1, season: 2023, type: "__proto__" as unknown as QuarterScoreType })
    ).rejects.toBeInstanceOf(EuroleagueValidationError);
    expect(calls).toHaveLength(0);
  });

  it("throws EuroleagueSchemaError on invalid quarter rows", async () => {
    const { fetch } = createFetch({ ByQuarter: [99] });
    const client = new EuroleagueClient({ fetch });

    await expect(client.boxscore.getQuarterScores({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(
      EuroleagueSchemaError
    );
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.boxscore.getGame({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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
    const payload = url.includes("live.euroleague.net/api/") ? boxscoreFixture : gamesIndex;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}

function createStatsRouter(): { calls: string[]; fetch: typeof globalThis.fetch } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    const url = String(input);
    calls.push(url);
    const payload = /\/games\/\d+\/stats/.test(url) ? gameStatsFixture : gamesIndex;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}
