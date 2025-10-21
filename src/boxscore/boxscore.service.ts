import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import { GetBoxscoreDto, GetSeasonBoxscoreDto } from './dto/get-boxscore.dto';

/**
 * Service for retrieving boxscore data from Euroleague API
 * Provides detailed player and team statistics for specific games
 */
@Injectable()
export class BoxscoreService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Get boxscore data for a specific game
   *
   * @param dto - Object containing season and gameCode
   * @returns Boxscore data including player and team statistics
   *
   * @example
   * ```typescript
   * const boxscore = await boxscoreService.getBoxscore({
   *   season: 2023,
   *   gameCode: 1,
   * });
   * ```
   */
  async getBoxscore(dto: GetBoxscoreDto): Promise<any> {
    const { season, gameCode } = dto;
    const url = this.makeSeasonGameUrl(season, gameCode, 'Boxscore');

    this.logger.log(`Fetching boxscore for season ${season}, game ${gameCode}`);

    return await this.httpService.get(url);
  }

  /**
   * Get boxscore data for multiple games in a season with optional range filtering
   * If startGameCode and endGameCode are omitted, returns all games for the season
   *
   * @param dto - Object containing season and optional game code range
   * @returns Array of boxscore data for each game in the range
   *
   * @example
   * ```typescript
   * // Get all games for the season
   * const allGames = await boxscoreService.getSeasonBoxscore({
   *   season: 2023,
   * });
   *
   * // Get games 1-10
   * const gamesRange = await boxscoreService.getSeasonBoxscore({
   *   season: 2023,
   *   startGameCode: 1,
   *   endGameCode: 10,
   * });
   * ```
   */
  async getSeasonBoxscore(dto: GetSeasonBoxscoreDto): Promise<any[]> {
    const { season, startGameCode, endGameCode } = dto;
    const gameCodes = await this.getGamecodesSeason(season);

    // Filter game codes if range specified
    let filteredGameCodes = gameCodes;
    if (startGameCode || endGameCode) {
      filteredGameCodes = gameCodes.filter((code) => {
        if (startGameCode && code < startGameCode) return false;
        if (endGameCode && code > endGameCode) return false;
        return true;
      });
    }

    this.logger.log(
      `Fetching boxscore for ${filteredGameCodes.length} games in season ${season}`,
    );

    const results: any[] = [];
    for (const gameCode of filteredGameCodes) {
      try {
        const boxscore = await this.getBoxscore({
          season,
          gameCode,
        });
        results.push({ gameCode, data: boxscore });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch boxscore for game ${gameCode}: ${error.message}`,
        );
      }
    }

    return results;
  }
}
