export const PLAYER_STATS_TYPES = ["advanced", "misc", "scoring", "traditional"] as const;
export type PlayerStatsType = (typeof PLAYER_STATS_TYPES)[number];
export type PlayerStatsMode = "Accumulated" | "PerGame";
export type PhaseTypeCode = "FF" | "PO" | "RS";

// The v3 statistics endpoint aggregates across all seasons unless told otherwise;
// "Single" scopes the response to the requested seasonCode, while "All" returns
// career/all-time aggregates. (The upstream "Range" mode needs from/to season
// codes the SDK does not send, so it is intentionally not exposed — use
// getStatsRange for multi-season queries.)
export type PlayerSeasonMode = "All" | "Single";

export interface PlayerStatsParams {
  limit?: number;
  mode?: PlayerStatsMode;
  phase?: PhaseTypeCode;
  season: number;
  seasonMode?: PlayerSeasonMode;
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
