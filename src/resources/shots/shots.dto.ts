export interface ShotGameParams {
  gameCode: number;
  season: number;
  validate?: boolean;
}

export interface ShotRoundParams {
  round: number;
  season: number;
  validate?: boolean;
}

export interface ShotSeasonParams {
  season: number;
  validate?: boolean;
}

export interface ShotSeasonsParams {
  from: number;
  to: number;
  validate?: boolean;
}
