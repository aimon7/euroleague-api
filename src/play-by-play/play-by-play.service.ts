import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import {
  GetPlayByPlayDto,
  GetSeasonPlayByPlayDto,
} from './dto/get-play-by-play.dto';

/**
 * Service for fetching play-by-play data from the Euroleague API
 * Provides detailed event-by-event game data
 */
@Injectable()
export class PlayByPlayService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Get play-by-play data for a specific game
   * @param dto - DTO containing season and game code
   * @returns Promise with play-by-play events
   */
  async getPlayByPlay(dto: GetPlayByPlayDto): Promise<any> {
    const url = this.makeSeasonGameUrl(dto.season, dto.gameCode, 'playbyplay');

    this.logger.log(
      `Fetching play-by-play data for season ${dto.season}, game ${dto.gameCode}`,
    );

    return await this.httpService.get(url);
  }

  /**
   * Get play-by-play data for multiple games in a season
   * @param dto - DTO containing season and optional game code range
   * @returns Promise with array of play-by-play data for multiple games
   */
  async getSeasonPlayByPlay(dto: GetSeasonPlayByPlayDto): Promise<any[]> {
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
      `Fetching play-by-play data for ${filteredGameCodes.length} games in season ${dto.season}`,
    );

    const results: any[] = [];
    for (const gameCode of filteredGameCodes) {
      try {
        const playByPlayData = await this.getPlayByPlay({
          season: dto.season,
          gameCode,
        });
        results.push({ gameCode, data: playByPlayData });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch play-by-play data for game ${gameCode}: ${error.message}`,
        );
      }
    }

    return results;
  }
}
