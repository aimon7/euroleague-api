import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import {
  PlayerStatsEndpoint,
  GetPlayerStatsSingleSeasonDto,
  GetPlayerStatsAllSeasonsDto,
  GetPlayerStatsRangeSeasonsDto,
  GetPlayerStatsLeadersDto,
} from './dto/get-player-stats.dto';
import { PhaseType } from '../common/enums/phase-type.enum';
import { StatisticMode } from '../common/enums/statistic-mode.enum';

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
    endpoint: PlayerStatsEndpoint,
    params: Record<string, string | number> = {},
    phaseTypeCode?: PhaseType,
    statisticMode: StatisticMode = StatisticMode.PER_GAME,
  ): Promise<any> {
    this.validateEndpoint(endpoint, Object.values(PlayerStatsEndpoint));

    if (phaseTypeCode) {
      this.validatePhaseType(phaseTypeCode, Object.values(PhaseType));
    }

    const url = `${this.url_v2}/competitiondata/playerstat/${endpoint}`;

    const queryParams = {
      limit: 500,
      ...params,
      ...(phaseTypeCode && { PhaseTypeCode: phaseTypeCode }),
      StatisticMode: statisticMode,
      SeasonCode: this.competition,
    };

    this.logger.log(
      `Fetching player stats - Endpoint: ${endpoint}, Params: ${JSON.stringify(queryParams)}`,
    );
    return await this.httpService.get(url, queryParams);
  }

  /**
   * Get player statistics for all seasons
   * @param dto - DTO with endpoint, phase type, and statistic mode
   * @returns Promise with player stats data
   */
  async getPlayerStatsAllSeasons(
    dto: GetPlayerStatsAllSeasonsDto,
  ): Promise<any> {
    const params = { SeasonMode: 'All' };
    return await this.getPlayerStats(
      dto.endpoint,
      params,
      dto.phaseTypeCode,
      dto.statisticMode || StatisticMode.PER_GAME,
    );
  }

  /**
   * Get player statistics for a single season
   * @param dto - DTO with endpoint, season, phase type, and statistic mode
   * @returns Promise with player stats data
   */
  async getPlayerStatsSingleSeason(
    dto: GetPlayerStatsSingleSeasonDto,
  ): Promise<any> {
    const params = {
      SeasonMode: 'Single',
      SeasonCode: `${this.competition}${dto.season}`,
    };
    return await this.getPlayerStats(
      dto.endpoint,
      params,
      dto.phaseTypeCode,
      dto.statisticMode || StatisticMode.PER_GAME,
    );
  }

  /**
   * Get player statistics for a range of seasons
   * @param dto - DTO with endpoint, start season, end season, phase type, and statistic mode
   * @returns Promise with player stats data
   */
  async getPlayerStatsRangeSeasons(
    dto: GetPlayerStatsRangeSeasonsDto,
  ): Promise<any> {
    const params = {
      SeasonMode: 'Range',
      FromSeasonCode: `${this.competition}${dto.startSeason}`,
      ToSeasonCode: `${this.competition}${dto.endSeason}`,
    };
    return await this.getPlayerStats(
      dto.endpoint,
      params,
      dto.phaseTypeCode,
      dto.statisticMode || StatisticMode.PER_GAME,
    );
  }

  /**
   * Get player stats leaders (top performers) for a specific season
   * @param season - The start year of the season
   * @param dto - DTO with stat category, top N, phase type, and statistic mode
   * @returns Promise with player leaders data
   */
  async getPlayerStatsLeaders(
    season: number,
    dto: GetPlayerStatsLeadersDto,
  ): Promise<any> {
    const url = `${this.url_v3}/seasondata/${this.competition}${season}/playersLeaders`;

    const queryParams = {
      limit: dto.topN || 200,
      StatCategory: dto.statCategory,
      ...(dto.phaseTypeCode && { PhaseTypeCode: dto.phaseTypeCode }),
      StatisticMode: dto.statisticMode || StatisticMode.PER_GAME,
    };

    this.logger.log(
      `Fetching player leaders - Season: ${season}, Category: ${dto.statCategory}`,
    );
    return await this.httpService.get(url, queryParams);
  }

  /**
   * Get player stats leaders for all seasons
   * @param dto - DTO with stat category, top N, phase type, and statistic mode
   * @returns Promise with player leaders data
   */
  async getPlayerStatsLeadersAllSeasons(
    dto: GetPlayerStatsLeadersDto,
  ): Promise<any> {
    const url = `${this.url_v3}/playersLeaders`;

    const queryParams = {
      limit: dto.topN || 200,
      StatCategory: dto.statCategory,
      ...(dto.phaseTypeCode && { PhaseTypeCode: dto.phaseTypeCode }),
      StatisticMode: dto.statisticMode || StatisticMode.PER_GAME,
      SeasonCode: this.competition,
    };

    this.logger.log(
      `Fetching player leaders for all seasons - Category: ${dto.statCategory}`,
    );
    return await this.httpService.get(url, queryParams);
  }
}
