import { EuroleagueValidationError } from "./errors";

export type Competition = "euroleague" | "eurocup";
export type CompetitionCode = "E" | "U";
export type ApiVersion = "v1" | "v2" | "v3";
export type LiveFeed =
  | "Boxscore"
  | "Comparison"
  | "Evolution"
  | "Header"
  | "PlaybyPlay"
  | "Players"
  | "Points"
  | "ShootingGraphic";

export interface ApiHosts {
  live: string;
  v1: string;
  v2: string;
  v3: string;
  wapi: string;
}

export interface EuroleagueClientOptions {
  competition?: Competition;
  fetch?: typeof fetch;
  hosts?: Partial<ApiHosts>;
  retries?: number;
  timeoutMs?: number;
}

export const DEFAULT_HOSTS: ApiHosts = {
  live: "https://live.euroleague.net/api",
  v1: "https://api-live.euroleague.net/v1/results",
  v2: "https://api-live.euroleague.net/v2",
  v3: "https://api-live.euroleague.net/v3",
  wapi: "https://live.euroleague.net/wapi"
};

const COMPETITION_CODES = {
  eurocup: "U",
  euroleague: "E"
} as const satisfies Record<Competition, CompetitionCode>;

export const FIRST_SUPPORTED_SEASON = 2000;

export function competitionCode(competition: Competition = "euroleague"): CompetitionCode {
  return COMPETITION_CODES[competition];
}

export function seasonCode(competition: Competition, season: number): string {
  assertSeason(season);
  return `${competitionCode(competition)}${season}`;
}

export function currentSeason(today = new Date()): number {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();

  return month >= 6 ? year : year - 1;
}

export function assertSeason(season: number): void {
  if (!Number.isInteger(season) || season < FIRST_SUPPORTED_SEASON) {
    throw new EuroleagueValidationError(
      `Expected season to be an integer >= ${FIRST_SUPPORTED_SEASON}. Received: ${season}`
    );
  }
}

export function assertSeasonRange(from: number, to: number): void {
  assertSeason(from);
  assertSeason(to);

  if (from > to) {
    throw new EuroleagueValidationError(`Expected from season to be <= to season. Received: ${from} > ${to}`);
  }
}

export function mergeHosts(overrides?: Partial<ApiHosts>): ApiHosts {
  return {
    ...DEFAULT_HOSTS,
    ...overrides
  };
}
