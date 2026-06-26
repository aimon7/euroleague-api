export const PLAYER_STATS_TYPES = ["advanced", "misc", "scoring", "traditional"] as const;
export type PlayerStatsType = (typeof PLAYER_STATS_TYPES)[number];
export type PlayerStatsMode = "Accumulated" | "PerGame";
export type PhaseTypeCode = "FF" | "PO" | "RS";

export interface PlayerStatsParams {
  limit?: number;
  mode?: PlayerStatsMode;
  phase?: PhaseTypeCode;
  season: number;
  type?: PlayerStatsType;
}

export interface PlayerStatsRangeParams extends Omit<PlayerStatsParams, "season"> {
  from: number;
  to: number;
}

export type PlayerStatsAllSeasonsParams = Omit<PlayerStatsParams, "season">;

export interface PlayerLeadersParams extends PlayerStatsParams {
  statistic: string;
}

export interface PlayerLeadersRangeParams extends PlayerStatsRangeParams {
  statistic: string;
}

export type PlayerLeadersAllSeasonsParams = PlayerStatsAllSeasonsParams & {
  statistic: string;
};
