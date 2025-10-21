import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { Competition } from '../common/enums/competition.enum';
import { GameStatsEndpoint } from './dto/get-game-stats.dto';

/**
 * Service for accessing game statistics from the Euroleague API
 */
@Injectable()
export class GameStatsService extends EuroleagueBaseService {
  private readonly validEndpoints = [
    GameStatsEndpoint.REPORT,
    GameStatsEndpoint.STATS,
    GameStatsEndpoint.TEAMS_COMPARISON,
  ];

  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Get game statistics for a specific game
   * @param season - The start year of the season
   * @param gameCode - The game code
   * @param endpoint - The type of game data (report, stats, or teamsComparison)
   * @returns Game statistics data
   */
  async getGameStats(
    season: number,
    gameCode: number,
    endpoint: GameStatsEndpoint = GameStatsEndpoint.STATS,
  ): Promise<any> {
    this.validateEndpoint(endpoint, this.validEndpoints as unknown as string[]);
    const url = this.makeSeasonGameUrl(season, gameCode, endpoint);
    return this.httpService.get(url);
  }

  /**
   * Get game report for a specific game
   * @param season - The start year of the season
   * @param gameCode - The game code
   * @returns Game report data
   */
  async getGameReport(season: number, gameCode: number): Promise<any> {
    return this.getGameStats(season, gameCode, GameStatsEndpoint.REPORT);
  }

  /**
   * Get teams comparison for a specific game
   * @param season - The start year of the season
   * @param gameCode - The game code
   * @returns Teams comparison data
   */
  async getGameTeamsComparison(season: number, gameCode: number): Promise<any> {
    return this.getGameStats(
      season,
      gameCode,
      GameStatsEndpoint.TEAMS_COMPARISON,
    );
  }

  /**
   * Get game statistics for all games in a single season
   * @param season - The start year of the season
   * @param endpoint - The type of game data
   * @returns Array of game statistics
   */
  async getSeasonGameStats(
    season: number,
    endpoint: GameStatsEndpoint = GameStatsEndpoint.STATS,
  ): Promise<any[]> {
    const gameCodes = await this.getGamecodesSeason(season);
    const results: any[] = [];

    for (const gameCode of gameCodes) {
      try {
        const data = await this.getGameStats(season, gameCode, endpoint);
        results.push({ season, gameCode, ...data });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch game ${gameCode} for season ${season}`,
          error,
        );
      }
    }

    return results;
  }

  /**
   * Get game statistics for all games in a specific round
   * @param season - The start year of the season
   * @param roundNumber - The round number
   * @param endpoint - The type of game data
   * @returns Array of game statistics for the round
   */
  async getRoundGameStats(
    season: number,
    roundNumber: number,
    endpoint: GameStatsEndpoint = GameStatsEndpoint.STATS,
  ): Promise<any[]> {
    const gameCodes = await this.getGamecodesRound(season, roundNumber);
    const results: any[] = [];

    for (const gameCode of gameCodes) {
      try {
        const data = await this.getGameStats(season, gameCode, endpoint);
        results.push({ season, roundNumber, gameCode, ...data });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch game ${gameCode} for round ${roundNumber}`,
          error,
        );
      }
    }

    return results;
  }

  /**
   * Get game statistics for a range of seasons
   * @param startSeason - The start year of the first season
   * @param endSeason - The start year of the last season
   * @param endpoint - The type of game data
   * @returns Array of game statistics for all seasons in range
   */
  async getRangeSeasonsGameStats(
    startSeason: number,
    endSeason: number,
    endpoint: GameStatsEndpoint = GameStatsEndpoint.STATS,
  ): Promise<any[]> {
    const results: any[] = [];

    for (let season = startSeason; season <= endSeason; season++) {
      try {
        const seasonData = await this.getSeasonGameStats(season, endpoint);
        results.push(...seasonData);
      } catch (error) {
        this.logger.warn(`Failed to fetch season ${season}`, error);
      }
    }

    return results;
  }
}
