import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import { GetShotDataDto, GetSeasonShotDataDto } from './dto/get-shot-data.dto';

/**
 * Service for fetching shot-level data from the Euroleague API
 * Provides detailed shot information including coordinates, outcome, and shooter details
 */
@Injectable()
export class ShotDataService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Get shot data for a specific game
   * @param dto - DTO containing season and game code
   * @returns Promise with shot data including coordinates, outcome, and player info
   */
  async getShotData(dto: GetShotDataDto): Promise<any> {
    const url = this.makeSeasonGameUrl(dto.season, dto.gameCode, 'shotdata');

    this.logger.log(
      `Fetching shot data for season ${dto.season}, game ${dto.gameCode}`,
    );

    return await this.httpService.get(url);
  }

  /**
   * Get shot data for multiple games in a season
   * @param dto - DTO containing season and optional game code range
   * @returns Promise with array of shot data for multiple games
   */
  async getSeasonShotData(dto: GetSeasonShotDataDto): Promise<any[]> {
    const gameCodes = await this.getGamecodesSeason(dto.season);

    // Filter game codes if range specified
    let filteredGameCodes = gameCodes;
    if (dto.startGameCode || dto.endGameCode) {
      filteredGameCodes = gameCodes.filter((code) => {
        if (dto.startGameCode && code < dto.startGameCode) return false;
        if (dto.endGameCode && code > dto.endGameCode) return false;
        return true;
      });
    }

    this.logger.log(
      `Fetching shot data for ${filteredGameCodes.length} games in season ${dto.season}`,
    );

    const results: any[] = [];
    for (const gameCode of filteredGameCodes) {
      try {
        const shotData = await this.getShotData({
          season: dto.season,
          gameCode,
        });
        results.push({ gameCode, data: shotData });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch shot data for game ${gameCode}: ${error.message}`,
        );
      }
    }

    return results;
  }
}
