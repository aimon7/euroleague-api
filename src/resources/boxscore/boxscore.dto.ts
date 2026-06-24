export type QuarterScoreType = "ByQuarter" | "EndOfQuarter";

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
