export interface PlayByPlayGameParams {
  gameCode: number;
  season: number;
  validate?: boolean;
}

export interface PlayByPlayRoundParams {
  round: number;
  season: number;
  validate?: boolean;
}

export interface PlayByPlaySeasonParams {
  season: number;
  validate?: boolean;
}

export interface PlayByPlaySeasonsParams {
  from: number;
  to: number;
  validate?: boolean;
}
