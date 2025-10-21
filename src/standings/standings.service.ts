import { Injectable, Optional } from '@nestjs/common';
import { EuroleagueBaseService } from '../core/euroleague-base.service';
import { EuroleagueHttpService } from '../core/euroleague-http.service';
import { Competition } from '../common/enums/competition.enum';
import { PhaseType } from '../common/enums/phase-type.enum';
import {
  StandingsType,
  GetStandingsDto,
  GetStandingsStreaksDto,
  GetStandingsMarginsDto,
  GetStandingsCalendarDto,
} from './dto/get-standings.dto';

/**
 * Service for fetching standings data from the Euroleague API
 * Supports standard standings, streaks, margins, and calendar views
 */
@Injectable()
export class StandingsService extends EuroleagueBaseService {
  constructor(
    httpService: EuroleagueHttpService,
    @Optional() competition?: Competition,
  ) {
    super(httpService, competition);
  }

  /**
   * Base method for fetching standings with type validation
   */
  private async getStandings(
    type: StandingsType,
    season: number,
    phaseTypeCode?: PhaseType,
    round?: number,
  ): Promise<any> {
    // Validate phase type if provided
    if (phaseTypeCode) {
      this.validatePhaseType(phaseTypeCode, Object.values(PhaseType));
    }

    const seasonCode = `${this.competition}${season}`;
    const url = `${this.url_v3}/seasonstandings/${seasonCode}/${type}`;

    const queryParams: Record<string, any> = {};

    if (phaseTypeCode) {
      queryParams.phaseTypeCode = phaseTypeCode;
    }

    if (round) {
      queryParams.round = round;
    }

    this.logger.log(
      `Fetching ${type} standings for season ${season}${phaseTypeCode ? `, phase ${phaseTypeCode}` : ''}${round ? `, round ${round}` : ''}`,
    );

    return await this.httpService.get(url, queryParams);
  }

  /**
   * Get standard standings for a season
   */
  async getStandardStandings(dto: GetStandingsDto): Promise<any> {
    this.logger.log(`Getting standard standings for season ${dto.season}`);

    return await this.getStandings(
      StandingsType.STANDARD,
      dto.season,
      dto.phaseTypeCode,
      dto.round,
    );
  }

  /**
   * Get standings with win/loss streaks
   */
  async getStandingsStreaks(dto: GetStandingsStreaksDto): Promise<any> {
    this.logger.log(`Getting standings streaks for season ${dto.season}`);

    return await this.getStandings(
      StandingsType.STREAKS,
      dto.season,
      dto.phaseTypeCode,
      dto.round,
    );
  }

  /**
   * Get standings with point margins/differentials
   */
  async getStandingsMargins(dto: GetStandingsMarginsDto): Promise<any> {
    this.logger.log(`Getting standings margins for season ${dto.season}`);

    return await this.getStandings(
      StandingsType.MARGINS,
      dto.season,
      dto.phaseTypeCode,
      dto.round,
    );
  }

  /**
   * Get standings calendar (results by round)
   */
  async getStandingsCalendar(dto: GetStandingsCalendarDto): Promise<any> {
    this.logger.log(`Getting standings calendar for season ${dto.season}`);

    return await this.getStandings(
      StandingsType.CALENDAR,
      dto.season,
      dto.phaseTypeCode,
      dto.round,
    );
  }
}
