import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import { GetGameMetadataDto } from './dto/get-game-metadata.dto';

/**
 * Service for retrieving game metadata from Euroleague API
 * Provides stadium information, referees, attendance, capacity, and other game details
 */
@Injectable()
export class GameMetadataService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Get metadata for a specific game
   * Includes stadium name, location, capacity, attendance, referees, and other game information
   *
   * @param dto - Object containing season and gameCode
   * @returns Game metadata including stadium, referees, attendance, etc.
   *
   * @example
   * ```typescript
   * const metadata = await gameMetadataService.getGameMetadata({
   *   season: 2023,
   *   gameCode: 1,
   * });
   * ```
   */
  async getGameMetadata(dto: GetGameMetadataDto): Promise<any> {
    const { season, gameCode } = dto;
    const url = this.makeSeasonGameUrl(season, gameCode, 'Header');

    this.logger.log(
      `Fetching game metadata for season ${season}, game ${gameCode}`,
    );

    return await this.httpService.get(url);
  }
}
