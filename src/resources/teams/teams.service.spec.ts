import { describe, expect, it, vi } from "vitest";

import {
  EuroleagueApiError,
  EuroleagueClient,
  EuroleagueSchemaError,
  EuroleagueValidationError,
  type TeamStatsType
} from "../../index";

import leadersFixture from "./__fixtures__/teams-leaders.json";
import statsFixture from "./__fixtures__/teams-stats.json";

describe("TeamsService", () => {
  it("builds the team stats URL and normalizes rows", async () => {
    const { calls, fetch } = createFetch(statsFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const stats = await client.teams.getStats({
      mode: "Accumulated",
      phase: "RS",
      season: 2023,
      type: "advanced"
    });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v3/competitions/E/statistics/teams/advanced"
    );
    expect(url.searchParams.get("seasonCode")).toBe("E2023");
    expect(url.searchParams.get("statisticMode")).toBe("Accumulated");
    expect(url.searchParams.get("phaseTypeCode")).toBe("RS");
    expect(url.searchParams.get("limit")).toBe("400");
    expect(stats[0]).toMatchObject({
      gamesPlayed: 34,
      teamCode: "MAD",
      teamName: "Real Madrid"
    });
  });

  it("defaults to the traditional opponents type and supports opponent endpoints", async () => {
    const { calls, fetch } = createFetch(statsFixture);
    const client = new EuroleagueClient({ fetch });

    await client.teams.getStats({ season: 2023, type: "opponentsTraditional" });

    const url = new URL(calls[0] ?? "");
    expect(url.pathname).toBe("/v3/competitions/E/statistics/teams/opponentsTraditional");
  });

  it("derives leaders from the v3 stats list, ranked by the statistic", async () => {
    const { calls, fetch } = createFetch(leadersFixture);
    const client = new EuroleagueClient({ competition: "eurocup", fetch });

    const leaders = await client.teams.getLeaders({ season: 2022, statistic: "points" });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe(
      "https://api-live.euroleague.net/v3/competitions/U/statistics/teams/traditional"
    );
    expect(url.searchParams.get("seasonCode")).toBe("U2022");
    expect(leaders.map((row) => row.teamName)).toEqual(["Beta", "Alpha"]);
  });

  it("rejects an unknown statistic", async () => {
    const { fetch } = createFetch(leadersFixture);
    const client = new EuroleagueClient({ fetch });

    await expect(client.teams.getLeaders({ season: 2023, statistic: "nope" })).rejects.toBeInstanceOf(
      EuroleagueValidationError
    );
  });

  it("aggregates stats across a season range", async () => {
    const { calls, fetch } = createFetch(statsFixture);
    const client = new EuroleagueClient({ fetch });

    const stats = await client.teams.getStatsRange({ from: 2021, to: 2022 });

    expect(calls).toHaveLength(2);
    expect(stats).toHaveLength(4);
    expect(new URL(calls[0] ?? "").searchParams.get("seasonCode")).toBe("E2021");
    expect(new URL(calls[1] ?? "").searchParams.get("seasonCode")).toBe("E2022");
  });

  it("aggregates leaders across ranges and every season", async () => {
    const leaders = createFetch(leadersFixture);
    const client = new EuroleagueClient({ fetch: leaders.fetch });

    const range = await client.teams.getLeadersRange({ from: 2021, statistic: "points", to: 2022 });
    expect(range).toHaveLength(4);

    const stats = createFetch(statsFixture);
    const statsClient = new EuroleagueClient({ fetch: stats.fetch });
    const all = await statsClient.teams.getStatsAllSeasons({ type: "advanced" });
    expect(stats.calls.length).toBeGreaterThan(1);
    expect(all).toHaveLength(stats.calls.length * 2);

    const allLeaders = createFetch(leadersFixture);
    const leadersClient = new EuroleagueClient({ fetch: allLeaders.fetch });
    const everySeason = await leadersClient.teams.getLeadersAllSeasons({ statistic: "points" });
    expect(everySeason).toHaveLength(allLeaders.calls.length * 2);
  });

  it("validates the stats type and rejects an injected path segment", async () => {
    const { calls, fetch } = createFetch(statsFixture);
    const client = new EuroleagueClient({ fetch });

    await client.teams.getStats({ season: 2023, type: "advanced" });
    expect(new URL(calls[0] ?? "").pathname).toBe("/v3/competitions/E/statistics/teams/advanced");

    await expect(
      client.teams.getStats({ season: 2023, type: "../../injected" as unknown as TeamStatsType })
    ).rejects.toBeInstanceOf(EuroleagueValidationError);
    expect(calls).toHaveLength(1);
  });

  it("throws EuroleagueSchemaError when the response row shape is invalid", async () => {
    const { fetch } = createFetch({ teams: [null] });
    const client = new EuroleagueClient({ fetch });

    await expect(client.teams.getStats({ season: 2023 })).rejects.toBeInstanceOf(EuroleagueSchemaError);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.teams.getStats({ season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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
