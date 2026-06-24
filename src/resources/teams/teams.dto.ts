export type TeamStatsType = "advanced" | "opponentsAdvanced" | "opponentsTraditional" | "traditional";
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

export type TeamLeadersParams = TeamStatsParams;
export type TeamLeadersRangeParams = TeamStatsRangeParams;
export type TeamLeadersAllSeasonsParams = TeamStatsAllSeasonsParams;
