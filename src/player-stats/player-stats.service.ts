import { Injectable, Optional } from '@nestjs/common';
import { SeasonMode } from 'src/common/enums/season-mode.enum';
import { Competition } from '../common/enums/competition.enum';
import { PhaseType } from '../common/enums/phase-type.enum';
import { StatisticMode } from '../common/enums/statistic-mode.enum';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import {
  GetPlayerStatsAllSeasonsDto,
  GetPlayerStatsRangeSeasonsDto,
  GetPlayerStatsSingleSeasonDto,
  PlayerStatsEndpoint,
} from './dto/get-player-stats.dto';
import { EuroleagueHttpService } from 'src/core/euroleague-http.service';

@Injectable()
export class PlayerStatsService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Get player statistics with flexible parameters
   * @param endpoint - The type of stats (traditional, advanced, misc, scoring)
   * @param params - Query parameters for the API
   * @param phaseTypeCode - Optional phase of the season
   * @param statisticMode - Mode for aggregating statistics
   * @returns Promise with player stats data
   */
  async getPlayerStats(
    competitionCode: Competition,
    endpoint: PlayerStatsEndpoint,
    params: Record<string, string | number> = {},
    statisticMode: StatisticMode = StatisticMode.PER_GAME,
    phaseTypeCode?: PhaseType,
  ): Promise<any> {
    let url = `${this.url_v3}/competitions/${competitionCode}/statistics/players/${endpoint}`;

    const queryParams = {
      ...params,
      phaseTypeCode,
      statisticMode,
    };

    if (Object.keys(queryParams).length > 0) {
      url =
        url +
        '?' +
        Object.entries(queryParams)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
    }

    this.logger.log(`Fetching player stats - Endpoint: ${url}`);

    return await this.httpService.get(url);
  }

  /**
   * Get player statistics for all seasons
   * @param dto - DTO with endpoint, phase type, and statistic mode
   * @returns Promise with player stats data
   */
  async getPlayerStatsAllSeasons(
    competitionCode: Competition,
    dto: GetPlayerStatsAllSeasonsDto,
  ): Promise<any> {
    const { endpoint, phaseTypeCode, statisticMode, ...rest } = dto;
    const params = { SeasonMode: SeasonMode.ALL, ...rest };

    return await this.getPlayerStats(
      competitionCode,
      endpoint,
      params,
      statisticMode,
      phaseTypeCode,
    );
  }

  /**
   * Get player statistics for a single season
   * @param dto - DTO with endpoint, season, phase type, and statistic mode
   * @returns Promise with player stats data
   */
  async getPlayerStatsSingleSeason(
    competitionCode: Competition,
    dto: GetPlayerStatsSingleSeasonDto,
  ): Promise<any> {
    const { endpoint, phaseTypeCode, statisticMode, ...rest } = dto;

    const params = {
      SeasonMode: SeasonMode.SINGLE,
      ...rest,
    };
    return await this.getPlayerStats(
      competitionCode,
      endpoint,
      params,
      statisticMode,
      phaseTypeCode,
    );
  }

  /**
   * Get player statistics for a range of seasons
   * @param dto - DTO with endpoint, start season, end season, phase type, and statistic mode
   * @returns Promise with player stats data
   */
  async getPlayerStatsRangeSeasons(
    competitionCode: Competition,
    dto: GetPlayerStatsRangeSeasonsDto,
  ): Promise<any> {
    const { endpoint, phaseTypeCode, statisticMode, ...rest } = dto;

    const params = {
      SeasonMode: SeasonMode.RANGE,
      ...rest,
    };
    return await this.getPlayerStats(
      competitionCode,
      endpoint,
      params,
      statisticMode,
      phaseTypeCode,
    );
  }

  // /**
  //  * Get player stats leaders (top performers) for a specific season
  //  * @param season - The start year of the season
  //  * @param dto - DTO with stat category, top N, phase type, and statistic mode
  //  * @returns Promise with player leaders data
  //  */
  // async getPlayerStatsLeaders(
  //   season: number,
  //   dto: GetPlayerStatsLeadersDto,
  // ): Promise<any> {
  //   const url = `${this.url_v3}/seasondata/${this.competition}${season}/playersLeaders`;

  //   const queryParams = {
  //     limit: dto.topN || 200,
  //     StatCategory: dto.statCategory,
  //     ...(dto.phaseTypeCode && { PhaseTypeCode: dto.phaseTypeCode }),
  //     StatisticMode: dto.statisticMode || StatisticMode.PER_GAME,
  //   };

  //   this.logger.log(
  //     `Fetching player leaders - Season: ${season}, Category: ${dto.statCategory}`,
  //   );
  //   return await this.httpService.get(url, queryParams);
  // }

  // /**
  //  * Get player stats leaders for all seasons
  //  * @param dto - DTO with stat category, top N, phase type, and statistic mode
  //  * @returns Promise with player leaders data
  //  */
  // async getPlayerStatsLeadersAllSeasons(
  //   dto: GetPlayerStatsLeadersDto,
  // ): Promise<any> {
  //   const url = `${this.url_v3}/playersLeaders`;

  //   const queryParams = {
  //     limit: dto.topN || 200,
  //     StatCategory: dto.statCategory,
  //     ...(dto.phaseTypeCode && { PhaseTypeCode: dto.phaseTypeCode }),
  //     StatisticMode: dto.statisticMode || StatisticMode.PER_GAME,
  //     SeasonCode: this.competition,
  //   };

  //   this.logger.log(
  //     `Fetching player leaders for all seasons - Category: ${dto.statCategory}`,
  //   );
  //   return await this.httpService.get(url, queryParams);
  // }
}
