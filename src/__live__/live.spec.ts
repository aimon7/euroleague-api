import { describe, expect, it } from "vitest";

import { EuroleagueClient } from "../index";

/**
 * Opt-in smoke tests that hit the real Euroleague API to detect upstream drift.
 * Skipped by default (and in CI). Run with `npm run test:live`.
 */
const live = process.env.EUROLEAGUE_LIVE === "1";
const LIVE_SEASON = Number(process.env.EUROLEAGUE_LIVE_SEASON ?? "2023");
const LIVE_TIMEOUT = 60_000;

describe.runIf(live)("live smoke tests", () => {
  const client = new EuroleagueClient({ competition: "euroleague", timeoutMs: LIVE_TIMEOUT });

  it(
    "fetches player stats for a season",
    async () => {
      const stats = await client.players.getStats({ season: LIVE_SEASON });

      expect(stats.length).toBeGreaterThan(0);
    },
    LIVE_TIMEOUT
  );

  it(
    "fetches standings for a round",
    async () => {
      const standings = await client.standings.getRound({ season: LIVE_SEASON, round: 1 });

      expect(standings.length).toBeGreaterThan(0);
    },
    LIVE_TIMEOUT
  );

  it(
    "fetches the shot chart of a single game",
    async () => {
      const shots = await client.shots.getGame({ season: LIVE_SEASON, gameCode: 1 });

      expect(shots.length).toBeGreaterThan(0);
    },
    LIVE_TIMEOUT
  );

  it(
    "fetches game metadata for a single game",
    async () => {
      const metadata = await client.gameMetadata.getGame({ season: LIVE_SEASON, gameCode: 1 });

      expect(metadata.teamA).toBeDefined();
    },
    LIVE_TIMEOUT
  );
});
