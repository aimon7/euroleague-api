import { describe, expect, it, vi } from "vitest";

import { EuroleagueApiError, EuroleagueClient } from "../../index";

import pbpFixture from "./__fixtures__/play-by-play.json";
import boxscoreFixture from "./__fixtures__/play-by-play-boxscore.json";
import reversedBoxscoreFixture from "./__fixtures__/play-by-play-boxscore-reversed.json";

const gamesIndex = {
  data: [
    { gameCode: 1, round: 1, played: true },
    { gameCode: 2, round: 1, played: true }
  ]
};

describe("PlayByPlayService", () => {
  it("merges every period into a single event list with a period marker", async () => {
    const { calls, fetch } = createFetch(pbpFixture);
    const client = new EuroleagueClient({ competition: "euroleague", fetch });

    const events = await client.playByPlay.getGame({ gameCode: 1, season: 2023 });

    const url = new URL(calls[0] ?? "");
    expect(url.origin + url.pathname).toBe("https://live.euroleague.net/api/PlaybyPlay");
    expect(events).toHaveLength(4);
    expect(events[0]).toMatchObject({ codeteam: "MAD", period: 1, player: "Tavares, Edy" });
    expect(events[3]).toMatchObject({ period: 2 });
  });

  it("skips validation when validate is false", async () => {
    const { fetch } = createFetch(pbpFixture);
    const client = new EuroleagueClient({ fetch });

    const events = await client.playByPlay.getGame({ gameCode: 1, season: 2023, validate: false });

    expect(events).toHaveLength(4);
    expect(events[0]).toMatchObject({ pointsA: 2 });
  });

  it("reconstructs on-court lineups from boxscore starters and substitutions", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    const lineups = await client.playByPlay.getLineups({ gameCode: 1, season: 2023 });

    const lastEvent = lineups.find((event) => event.numberofplay === 4);
    expect(lastEvent?.homeLineup).toHaveLength(5);
    expect(lastEvent?.homeLineup).toContain("Tavares, Edy");
    expect(lastEvent?.awayLineup).toContain("Laprovittola, Nicolas");
    expect(lastEvent?.awayLineup).not.toContain("Vesely, Jan");
  });

  it("attributes starters to the correct side when the boxscore team order is reversed", async () => {
    const { fetch } = createRouter(reversedBoxscoreFixture);
    const client = new EuroleagueClient({ fetch });

    const lineups = await client.playByPlay.getLineups({ gameCode: 1, season: 2023 });

    // The boxscore lists FC Barcelona (CodeTeamB) first and Real Madrid
    // (CodeTeamA) second, the reverse of the PlaybyPlay order. Matching by team
    // code (not array index) keeps each lineup on its correct side.
    const lastEvent = lineups.find((event) => event.numberofplay === 4);
    expect(lastEvent?.homeLineup).toContain("Tavares, Edy");
    expect(lastEvent?.homeLineup).not.toContain("Laprovittola, Nicolas");
    expect(lastEvent?.awayLineup).toContain("Laprovittola, Nicolas");
    expect(lastEvent?.awayLineup).not.toContain("Tavares, Edy");
    expect(lastEvent?.awayLineup).not.toContain("Vesely, Jan");
  });

  it("never lets a lineup exceed five players when an IN precedes its paired OUT", async () => {
    const reorderedPbp = {
      CodeTeamA: "MAD",
      CodeTeamB: "BAR",
      FirstQuarter: [
        {
          NUMBEROFPLAY: "1",
          CODETEAM: "BAR ",
          PLAYER_ID: "P106 ",
          PLAYER: "Laprovittola, Nicolas",
          PLAYTYPE: "IN",
          MARKERTIME: "08:00"
        },
        {
          NUMBEROFPLAY: "2",
          CODETEAM: "BAR ",
          PLAYER_ID: "P101 ",
          PLAYER: "Vesely, Jan",
          PLAYTYPE: "OUT",
          MARKERTIME: "08:00"
        }
      ],
      SecondQuarter: [
        {
          NUMBEROFPLAY: "3",
          CODETEAM: "MAD ",
          PLAYER_ID: "P002 ",
          PLAYER: "Llull, Sergio",
          PLAYTYPE: "AST",
          MARKERTIME: "05:00"
        }
      ],
      ThirdQuarter: [],
      ForthQuarter: [],
      ExtraTime: []
    };
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
      const payload = String(input).includes("/api/Boxscore") ? boxscoreFixture : reorderedPbp;

      return new Response(JSON.stringify(payload), {
        headers: { "content-type": "application/json" },
        status: 200
      });
    });
    const client = new EuroleagueClient({ fetch });

    const lineups = await client.playByPlay.getLineups({ gameCode: 1, season: 2023 });

    const lineupSize = (value: unknown): number => (Array.isArray(value) ? value.length : 0);
    for (const event of lineups) {
      expect(lineupSize(event.homeLineup)).toBeLessThanOrEqual(5);
      expect(lineupSize(event.awayLineup)).toBeLessThanOrEqual(5);
    }

    const steadyState = lineups.find((event) => event.numberofplay === 3);
    expect(steadyState?.awayLineup).toContain("Laprovittola, Nicolas");
    expect(steadyState?.awayLineup).not.toContain("Vesely, Jan");
  });

  it("aggregates events and lineups across rounds, seasons, and ranges", async () => {
    const { fetch } = createRouter();
    const client = new EuroleagueClient({ fetch });

    expect(await client.playByPlay.getRound({ round: 1, season: 2023 })).toHaveLength(8);
    expect(await client.playByPlay.getSeason({ season: 2023 })).toHaveLength(8);
    expect(await client.playByPlay.getSeasons({ from: 2022, to: 2023 })).toHaveLength(16);
    expect(await client.playByPlay.getLineupsRound({ round: 1, season: 2023 })).toHaveLength(8);
    expect(await client.playByPlay.getLineupsSeason({ season: 2023 })).toHaveLength(8);
    expect(await client.playByPlay.getLineupsSeasons({ from: 2022, to: 2023 })).toHaveLength(16);
  });

  it("returns an empty list when the feed has no period data", async () => {
    const { fetch } = createFetch({ CodeTeamA: "MAD", CodeTeamB: "BAR" });
    const client = new EuroleagueClient({ fetch });

    await expect(client.playByPlay.getGame({ gameCode: 1, season: 2023 })).resolves.toEqual([]);
  });

  it("throws EuroleagueApiError for non-2xx responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response("nope", { status: 500 }));
    const client = new EuroleagueClient({ fetch });

    await expect(client.playByPlay.getGame({ gameCode: 1, season: 2023 })).rejects.toBeInstanceOf(EuroleagueApiError);
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

function createRouter(boxscore: unknown = boxscoreFixture): { calls: string[]; fetch: typeof globalThis.fetch } {
  const calls: string[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    const url = String(input);
    calls.push(url);
    const payload = url.includes("/api/Boxscore")
      ? boxscore
      : url.includes("live.euroleague.net/api/")
        ? pbpFixture
        : gamesIndex;

    return new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 200
    });
  });

  return { calls, fetch };
}
