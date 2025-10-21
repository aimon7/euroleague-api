import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import { PhaseType } from '../common/enums/phase-type.enum';
import { StatisticMode } from '../common/enums/statistic-mode.enum';
import {
  TeamStatsEndpoint,
  GetTeamStatsSingleSeasonDto,
  GetTeamStatsAllSeasonsDto,
  GetTeamStatsRangeSeasonsDto,
} from './dto/get-team-stats.dto';

/**
 * Service for fetching team statistics from the Euroleague API
 * Supports traditional stats, advanced stats, opponent stats, and opponent advanced stats
 */
@Injectable()
export class TeamStatsService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Base method for fetching team stats with endpoint validation
   */
  private async getTeamStats(
    endpoint: TeamStatsEndpoint,
    params: Record<string, any>,
    phaseTypeCode?: PhaseType,
    statisticMode: StatisticMode = StatisticMode.PER_GAME,
  ): Promise<any> {
    // Validate endpoint
    this.validateEndpoint(endpoint, Object.values(TeamStatsEndpoint));

    // Validate phase type if provided
    if (phaseTypeCode) {
      this.validatePhaseType(phaseTypeCode, Object.values(PhaseType));
    }

    const url = `${this.url_v2}/teamstats/${endpoint}`;

    this.logger.log(
      `Fetching team ${endpoint} stats with params: ${JSON.stringify(params)}`,
    );

    const queryParams = {
      ...params,
      ...(phaseTypeCode && { Phase: phaseTypeCode }),
      StatisticMode: statisticMode,
      limit: 100,
    };

    return await this.httpService.get(url, queryParams);
  }

  /**
   * Get team stats for all seasons
   */
  async getTeamStatsAllSeasons(dto: GetTeamStatsAllSeasonsDto): Promise<any> {
    this.logger.log(
      `Getting team stats for all seasons - endpoint: ${dto.endpoint}`,
    );

    return await this.getTeamStats(
      dto.endpoint,
      { SeasonMode: 'All' },
      dto.phaseTypeCode,
      dto.statisticMode,
    );
  }

  /**
   * Get team stats for a single season
   */
  async getTeamStatsSingleSeason(
    dto: GetTeamStatsSingleSeasonDto,
  ): Promise<any> {
    this.logger.log(
      `Getting team stats for season ${dto.season} - endpoint: ${dto.endpoint}`,
    );

    return await this.getTeamStats(
      dto.endpoint,
      { SeasonMode: 'Single', SeasonCode: `E${dto.season}` },
      dto.phaseTypeCode,
      dto.statisticMode,
    );
  }

  /**
   * Get team stats for a range of seasons
   */
  async getTeamStatsRangeSeasons(
    dto: GetTeamStatsRangeSeasonsDto,
  ): Promise<any> {
    this.logger.log(
      `Getting team stats from season ${dto.startSeason} to ${dto.endSeason} - endpoint: ${dto.endpoint}`,
    );

    return await this.getTeamStats(
      dto.endpoint,
      {
        SeasonMode: 'Range',
        FromSeasonCode: `E${dto.startSeason}`,
        ToSeasonCode: `E${dto.endSeason}`,
      },
      dto.phaseTypeCode,
      dto.statisticMode,
    );
  }
}
