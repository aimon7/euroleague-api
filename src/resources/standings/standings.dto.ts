export type StandingsType = "aheadbehind" | "basicstandings" | "calendarstandings" | "margins" | "streaks";

export interface StandingsRoundParams {
  round: number;
  season: number;
  type?: StandingsType;
}
