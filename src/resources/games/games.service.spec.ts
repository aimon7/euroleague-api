import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueClient, EuroleagueSchemaError, EuroleagueValidationError } from "../../index";

import comparisonFixture from "./__fixtures__/comparison.json";
import gameFixture from "./__fixtures__/game.json";
import gameReportFixture from "./__fixtures__/game-report.json";
import gamesIndexFixture from "./__fixtures__/games-index.json";
import pointsBreakdownFixture from "./__fixtures__/points-breakdown.json";
import scoreEvolutionFixture from "./__fixtures__/score-evolution.json";

describe("GamesService", () => {
  it("builds the single-game info URL and parses the v2 payload", async () => {
    const { calls, fetch } = createFetch(gameFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const game = await client.games.getGame({ gameCode: 1, season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://api-live.euroleague.net/v2/competitions/E/seasons/E2025/games/1");
    expect(game).toMatchObject({
      gameCode: 1,
      identifier: "E2025_1",
      gameStatus: "Confirmed",
      round: 1,
      season: { code: "E2025", year: 2025 }
    });
    expect(game.local?.club).toMatchObject({ code: "IST", name: "Anadolu Efes Istanbul" });
    expect(game.local?.score).toBe(85);
    expect(game.road?.club).toMatchObject({ code: "TEL" });
    expect(game.venue?.name).toBe("MORACA");
    expect(game.referee1?.code).toBe("OJFC");
  });

  it("aggregates single-game info across a round", async () => {
    const { calls, fetch } = createGameInfoRouter();
    const client = new EuroleagueClient({ fetch });

    const games = await client.games.getGameRound({ round: 1, season: 2023 });

    const indexCall = new URL(calls[0] ?? "");
    expect(indexCall.pathname).toBe("/v2/competitions/E/seasons/E2023/games");
    expect(indexCall.searchParams.get("roundNumber")).toBe("1");
    expect(games).toHaveLength(2);
    expect(games[0]?.gameCode).toBe(1);
  });

  it("rejects a non-integer gameCode before making a request", async () => {
    const { calls, fetch } = createFetch(gameFixture);
    const client = new EuroleagueClient({ fetch });

    await expect(
      client.games.getGame({ gameCode: "1/../injected" as unknown as number, season: 2025 })
    ).rejects.toBeInstanceOf(EuroleagueValidationError);
    expect(calls).toHaveLength(0);
  });

  it("builds the ShootingGraphic live-feed URL and parses the points breakdown", async () => {
    const { calls, fetch } = createFetch(pointsBreakdownFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const breakdown = await client.games.getPointsBreakdown({ gameCode: 1, season: 2025 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/api/ShootingGraphic");
    expect(url.searchParams.get("gamecode")).toBe("1");
    expect(url.searchParams.get("seasoncode")).toBe("E2025");
    expect(breakdown).toMatchObject({ SecondChancePointsB: 8, TurnoversPointsA: 19 });
  });

  it("targets the Comparison feed and parses team comparison fields", async () => {
    const { calls, fetch } = createFetch(comparisonFixture);
    const client = new EuroleagueClient({ fetch });

    const comparison = await client.games.getComparison({ gameCode: 1, season: 2025 });

    expect(new URL(calls[0] ?? "").pathname).toBe("/api/Comparison");
    expect(comparison).toMatchObject({ DefensiveReboundsA: 26, isLive: false, prevA: "75-76" });
  });

  it("targets the Evolution feed and parses the score evolution series", async () => {
    const { calls, fetch } = createFetch(scoreEvolutionFixture);
    const client = new EuroleagueClient({ fetch });

    const evolution = await client.games.getScoreEvolution({ gameCode: 1, season: 2025 });

    expect(new URL(calls[0] ?? "").pathname).toBe("/api/Evolution");
    expect(evolution.PointsList?.[0]).toHaveLength(41);
    expect(evolution.MinutesList).toHaveLength(41);
    expect(evolution.ScoreMaxA).toBe("85 - 78");
  });

  it("builds the single-game report URL and deep-normalizes the response", async () => {
    const { calls, fetch } = createFetch(gameReportFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const report = await client.games.getReport({ gameCode: 1, season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v3/competitions/E/seasons/E2023/games/1/report"
    );
    expect(report).toMatchObject({ gameCode: 1, round: 1 });
    expect(report.localClub).toEqual({ code: "MAD", score: 80 });
  });

  it("targets the stats and teamsComparison endpoints", async () => {
    const { calls, fetch } = createFetch(gameReportFixture);
    const client = new EuroleagueClient({ fetch });

    await client.games.getStats({ gameCode: 5, season: 2023 });
    await client.games.getTeamsComparison({ gameCode: 5, season: 2023 });

    expect(new URL(calls[0] ?? "").pathname).toBe("/v3/competitions/E/seasons/E2023/games/5/stats");
    expect(new URL(calls[1] ?? "").pathname).toBe("/v3/competitions/E/seasons/E2023/games/5/teamsComparison");
  });

  it("aggregates a round by enumerating played game codes", async () => {
    const { calls, fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    const reports = await client.games.getReportRound({ round: 1, season: 2023 });

    const indexCall = new URL(calls[0] ?? "");
    expect(indexCall.pathname).toBe("/v2/competitions/E/seasons/E2023/games");
    expect(indexCall.searchParams.get("roundNumber")).toBe("1");
    expect(reports).toHaveLength(2);
  });

  it("aggregates a season skipping unplayed games", async () => {
    const { calls, fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    const reports = await client.games.getReportSeason({ season: 2023 });

    expect(calls[0]).toContain("/seasons/E2023/games");
    expect(reports).toHaveLength(2);
  });

  it("aggregates stats and teamsComparison across rounds, seasons, and ranges", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    expect(await client.games.getReportSeasons({ from: 2022, to: 2023 })).toHaveLength(4);
    expect(await client.games.getStatsRound({ round: 1, season: 2023 })).toHaveLength(2);
    expect(await client.games.getStatsSeason({ season: 2023 })).toHaveLength(2);
    expect(await client.games.getStatsSeasons({ from: 2022, to: 2023 })).toHaveLength(4);
    expect(await client.games.getTeamsComparisonRound({ round: 1, season: 2023 })).toHaveLength(2);
    expect(await client.games.getTeamsComparisonSeason({ season: 2023 })).toHaveLength(2);
    expect(await client.games.getTeamsComparisonSeasons({ from: 2022, to: 2023 })).toHaveLength(4);
  });

  it("throws EuroleagueSchemaError when the payload is not an object", async () => {
    const { fetch } = createFetch(["unexpected"]);
    const client = new EuroleagueClient({ fetch });

    await expect(client.games.getReport({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 502 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.games.getReport({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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
    const payload = /\/games\/\d+\//.test(url) ? gameReportFixture : gamesIndexFixture;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}

// Routes the bare v2 single-game info endpoint (/games/{n}) to the game fixture
// and the round index (/games?roundNumber=) to the games index.
function createGameInfoRouter(): { calls: string[]; fetch: typeof globalThis.fetch } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    const url = String(input);
    calls.push(url);
    const payload = /\/games\/\d+$/.test(new URL(url).pathname) ? gameFixture : gamesIndexFixture;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}
