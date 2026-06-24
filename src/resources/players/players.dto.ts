export type PlayerStatsType = "advanced" | "misc" | "scoring" | "traditional";
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

export type PlayerLeadersParams = PlayerStatsParams;
export type PlayerLeadersRangeParams = PlayerStatsRangeParams;
export type PlayerLeadersAllSeasonsParams = PlayerStatsAllSeasonsParams;
