export const TEAM_STATS_TYPES = ["advanced", "opponentsAdvanced", "opponentsTraditional", "traditional"] as const;
export type TeamStatsType = (typeof TEAM_STATS_TYPES)[number];
export type TeamStatsMode = "Accumulated" | "PerGame";
export type TeamPhaseTypeCode = "FF" | "PO" | "RS";

// The v3 statistics endpoint aggregates across all seasons unless told otherwise;
// "Single" scopes the response to the requested seasonCode, while "All" returns
// all-time aggregates. (The upstream "Range" mode needs from/to season codes the
// SDK does not send, so it is intentionally not exposed — use getStatsRange for
// multi-season queries.)
export const TEAM_SEASON_MODES = ["All", "Single"] as const;
export type TeamSeasonMode = (typeof TEAM_SEASON_MODES)[number];

export interface TeamStatsParams {
  limit?: number;
  mode?: TeamStatsMode;
  phase?: TeamPhaseTypeCode;
  season: number;
  seasonMode?: TeamSeasonMode;
  type?: TeamStatsType;
}

export interface TeamStatsRangeParams extends Omit<TeamStatsParams, "season"> {
  from: number;
  to: number;
}

export type TeamStatsAllSeasonsParams = Omit<TeamStatsParams, "season">;

export interface TeamLeadersParams extends TeamStatsParams {
  statistic: string;
}

export interface TeamLeadersRangeParams extends TeamStatsRangeParams {
  statistic: string;
}

export type TeamLeadersAllSeasonsParams = TeamStatsAllSeasonsParams & {
  statistic: string;
};
