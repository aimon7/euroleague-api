import { HttpService } from '@nestjs/axios';
import axios, { AxiosInstance } from 'axios';
import { EuroleagueHttpService } from './core/euroleague-http.service';
import { GameStatsService } from './game-stats/game-stats.service';
import { PlayerStatsService } from './player-stats/player-stats.service';
import { TeamStatsService } from './team-stats/team-stats.service';
import { StandingsService } from './standings/standings.service';
import { ShotDataService } from './shot-data/shot-data.service';
import { PlayByPlayService } from './play-by-play/play-by-play.service';
import { BoxscoreService } from './boxscore/boxscore.service';
import { GameMetadataService } from './game-metadata/game-metadata.service';
import { Competition } from './common/enums/competition.enum';

export interface EuroleagueClientOptions {
  /**
   * Competition code: 'E' for Euroleague, 'U' for Eurocup
   * @default 'E' (Euroleague)
   */
  competition?: Competition;

  /**
   * Request timeout in milliseconds
   * @default 60000
   */
  timeout?: number;

  /**
   * Maximum number of redirects to follow
   * @default 5
   */
  maxRedirects?: number;
}

export interface EuroleagueClient {
  gameStats: GameStatsService;
  playerStats: PlayerStatsService;
  teamStats: TeamStatsService;
  standings: StandingsService;
  shotData: ShotDataService;
  playByPlay: PlayByPlayService;
  boxscore: BoxscoreService;
  gameMetadata: GameMetadataService;
}

/**
 * Factory function to create a Euroleague API client with all services initialized
 * This is the recommended way to use the library in standalone (non-NestJS) applications
 *
 * @param options - Configuration options for the client
 * @returns An object with all Euroleague API services
 *
 * @example
 * ```typescript
 * import { createEuroleagueClient } from '@aimon7/euroleague-api';
 *
 * const client = createEuroleagueClient({
 *   competition: 'E', // Euroleague
 *   timeout: 60000,
 * });
 *
 * // Use any service
 * const gameStats = await client.gameStats.getGameStats(2023, 1);
 * const playerStats = await client.playerStats.getPlayerStatsSingleSeason({
 *   endpoint: 'traditional',
 *   season: 2023,
 * });
 * ```
 */
export function createEuroleagueClient(
  options: EuroleagueClientOptions = {},
): EuroleagueClient {
  const {
    competition = Competition.EUROLEAGUE,
    timeout = 60000,
    maxRedirects = 5,
  } = options;

  // Create Axios instance with configuration
  const axiosInstance: AxiosInstance = axios.create({
    timeout,
    maxRedirects,
  });

  // Create HttpService from @nestjs/axios
  const httpService = new HttpService(axiosInstance);

  // Create the Euroleague HTTP service wrapper
  const euroleagueHttpService = new EuroleagueHttpService(httpService);

  // Initialize all services
  return {
    gameStats: new GameStatsService(euroleagueHttpService, competition),
    playerStats: new PlayerStatsService(euroleagueHttpService, competition),
    teamStats: new TeamStatsService(euroleagueHttpService, competition),
    standings: new StandingsService(euroleagueHttpService, competition),
    shotData: new ShotDataService(euroleagueHttpService, competition),
    playByPlay: new PlayByPlayService(euroleagueHttpService, competition),
    boxscore: new BoxscoreService(euroleagueHttpService, competition),
    gameMetadata: new GameMetadataService(euroleagueHttpService, competition),
  };
}
