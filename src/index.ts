export type { ApiHosts, Competition, EuroleagueClientOptions } from "./core/config";
export {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueParseError,
  EuroleagueSchemaError,
  EuroleagueTimeoutError,
  EuroleagueValidationError
} from "./core/errors";
export { euroleague, EuroleagueClient } from "./euroleague-client";
export type {
  Boxscore,
  BoxscoreGameParams,
  BoxscoreRoundParams,
  BoxscoreSeasonParams,
  BoxscoreSeasonsParams,
  PlayerBoxscore,
  QuarterScore,
  QuarterScoresGameParams,
  QuarterScoresRoundParams,
  QuarterScoresSeasonParams,
  QuarterScoresSeasonsParams,
  QuarterScoreType
} from "./resources/boxscore";
export type { Club, ClubParams, ClubRosterMember, ClubRosterParams, ClubsListParams } from "./resources/clubs";
export type { CompetitionGetParams, CompetitionInfo, CompetitionsListParams } from "./resources/competitions";
export type {
  GameMetadata,
  GameMetadataGameParams,
  GameMetadataRoundParams,
  GameMetadataSeasonParams,
  GameMetadataSeasonsParams
} from "./resources/game-metadata";
export type {
  GameInfo,
  GameRef,
  GameReport,
  GameRoundParams,
  GameSeasonParams,
  GameSeasonsParams,
  GameStats,
  GameTeamsComparison
} from "./resources/games";
export type {
  PeoplePhaseType,
  PersonCareerParams,
  PersonCareerStatsParams,
  PersonCodeParams,
  PersonGame,
  PersonGameStat,
  PersonProfile,
  PersonProfileParams,
  PersonRecord,
  PersonRecordsParams,
  PersonRegistration,
  PersonSeasonParams,
  PersonSeasonRegistrationParams,
  PersonSeasonStatsParams,
  PersonStats,
  PersonStatsLine
} from "./resources/people";
export type { Phase, PhaseParams, PhasesListParams, PhaseType } from "./resources/phases";
export type {
  PlayByPlayEvent,
  PlayByPlayGameParams,
  PlayByPlayLineup,
  PlayByPlayRoundParams,
  PlayByPlaySeasonParams,
  PlayByPlaySeasonsParams
} from "./resources/play-by-play";
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
export type { Round, RoundParams, RoundsListParams } from "./resources/rounds";
export type {
  ScheduleGame,
  ScheduleRoundParams,
  ScheduleSeasonParams,
  ScheduleSeasonsParams
} from "./resources/schedule";
export type { Season, SeasonsListParams } from "./resources/seasons";
export type {
  ShotEvent,
  ShotGameParams,
  ShotRoundParams,
  ShotSeasonParams,
  ShotSeasonsParams
} from "./resources/shots";
export type { Standing, StandingsRoundParams, StandingsType } from "./resources/standings";
export type {
  TeamLeader,
  TeamLeadersAllSeasonsParams,
  TeamLeadersParams,
  TeamLeadersRangeParams,
  TeamPhaseTypeCode,
  TeamStat,
  TeamStatsAllSeasonsParams,
  TeamStatsMode,
  TeamStatsParams,
  TeamStatsRangeParams,
  TeamStatsType
} from "./resources/teams";
