export interface GameMetadataGameParams {
  gameCode: number;
  season: number;
}

export interface GameMetadataRoundParams {
  round: number;
  season: number;
}

export interface GameMetadataSeasonParams {
  season: number;
}

export interface GameMetadataSeasonsParams {
  from: number;
  to: number;
}
