export const STANDINGS_TYPES = ["aheadbehind", "basicstandings", "calendarstandings", "margins", "streaks"] as const;
export type StandingsType = (typeof STANDINGS_TYPES)[number];

export interface StandingsRoundParams {
  round: number;
  season: number;
  type?: StandingsType;
}
