export type { ApiHosts, Competition, EuroleagueClientOptions } from "./core/config";
export { EuroleagueApiError, EuroleagueSchemaError, EuroleagueValidationError } from "./core/errors";
export { euroleague, EuroleagueClient } from "./euroleague-client";
export type {
  PhaseTypeCode,
  PlayerLeader,
  PlayerLeadersAllSeasonsParams,
  PlayerLeadersParams,
  PlayerLeadersRangeParams,
  PlayerStat,
  PlayerStatsAllSeasonsParams,
  PlayerStatsMode,
  PlayerStatsParams,
  PlayerStatsRangeParams,
  PlayerStatsType
} from "./resources/players";
