export interface GameRef {
  gameCode: number;
  season: number;
}

export interface GameRoundParams {
  round: number;
  season: number;
}

export interface GameSeasonParams {
  season: number;
}

export interface GameSeasonsParams {
  from: number;
  to: number;
}
