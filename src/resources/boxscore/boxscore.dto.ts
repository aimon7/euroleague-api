export const QUARTER_SCORE_TYPES = ["ByQuarter", "EndOfQuarter"] as const;
export type QuarterScoreType = (typeof QUARTER_SCORE_TYPES)[number];

export interface BoxscoreGameParams {
  gameCode: number;
  season: number;
}

export interface BoxscoreRoundParams {
  round: number;
  season: number;
}

export interface BoxscoreSeasonParams {
  season: number;
}

export interface BoxscoreSeasonsParams {
  from: number;
  to: number;
}

export interface BoxscoreRosterParams extends BoxscoreGameParams {
  clubCode: string;
}

export interface QuarterScoresGameParams extends BoxscoreGameParams {
  type?: QuarterScoreType;
}

export interface QuarterScoresRoundParams extends BoxscoreRoundParams {
  type?: QuarterScoreType;
}

export interface QuarterScoresSeasonParams extends BoxscoreSeasonParams {
  type?: QuarterScoreType;
}

export interface QuarterScoresSeasonsParams extends BoxscoreSeasonsParams {
  type?: QuarterScoreType;
}
