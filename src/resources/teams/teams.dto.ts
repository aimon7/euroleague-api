export const TEAM_STATS_TYPES = ["advanced", "opponentsAdvanced", "opponentsTraditional", "traditional"] as const;
export type TeamStatsType = (typeof TEAM_STATS_TYPES)[number];
export type TeamStatsMode = "Accumulated" | "PerGame";
export type TeamPhaseTypeCode = "FF" | "PO" | "RS";

export interface TeamStatsParams {
  limit?: number;
  mode?: TeamStatsMode;
  phase?: TeamPhaseTypeCode;
  season: number;
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
