import { describe, expect, it } from "vitest";

import { EuroleagueClient } from "../index";

/**
 * Opt-in smoke tests that hit the real Euroleague API to detect upstream drift.
 * Skipped by default (and in CI). Run with `npm run test:live`.
 */
const live = process.env.EUROLEAGUE_LIVE === "1";
const LIVE_SEASON = Number(process.env.EUROLEAGUE_LIVE_SEASON ?? "2023");
const LIVE_CLUB_CODE = process.env.EUROLEAGUE_LIVE_CLUB_CODE ?? "OLY";
const LIVE_PERSON_CODE = process.env.EUROLEAGUE_LIVE_PERSON_CODE ?? "013380";
const LIVE_PERSON_SEASON = Number(process.env.EUROLEAGUE_LIVE_PERSON_SEASON ?? "2024");
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

  it(
    "fetches seasons metadata",
    async () => {
      const seasons = await client.seasons.list();

      expect(seasons.length).toBeGreaterThan(0);
      expect(seasons.some((season) => season.year === LIVE_SEASON)).toBe(true);
    },
    LIVE_TIMEOUT
  );

  it(
    "fetches club metadata and roster",
    async () => {
      const clubs = await client.clubs.list({ season: LIVE_SEASON });
      const club = await client.clubs.get({ season: LIVE_SEASON, clubCode: LIVE_CLUB_CODE });
      const roster = await client.clubs.getRoster({ season: LIVE_SEASON, clubCode: LIVE_CLUB_CODE });

      expect(clubs.length).toBeGreaterThan(0);
      expect(club.code).toBe(LIVE_CLUB_CODE);
      expect(roster.length).toBeGreaterThan(0);
    },
    LIVE_TIMEOUT
  );

  it(
    "fetches person profile, stats, and records",
    async () => {
      const profile = await client.people.getProfile({ personCode: LIVE_PERSON_CODE });
      const career = await client.people.getCareer({ personCode: LIVE_PERSON_CODE });
      const registration = await client.people.getSeasonRegistration({
        season: LIVE_PERSON_SEASON,
        personCode: LIVE_PERSON_CODE
      });
      const careerStats = await client.people.getCareerStats({ personCode: LIVE_PERSON_CODE, phase: "RS" });
      const seasonStats = await client.people.getSeasonStats({
        season: LIVE_PERSON_SEASON,
        personCode: LIVE_PERSON_CODE,
        phase: "RS"
      });
      const records = await client.people.getRecords({ personCode: LIVE_PERSON_CODE });

      expect(profile.code).toBe(LIVE_PERSON_CODE);
      expect(career.length).toBeGreaterThan(0);
      expect(registration.person.code).toBe(LIVE_PERSON_CODE);
      expect(careerStats.games.length).toBeGreaterThan(0);
      expect(seasonStats.games.length).toBeGreaterThan(0);
      expect(records.length).toBeGreaterThan(0);
    },
    LIVE_TIMEOUT
  );
});
