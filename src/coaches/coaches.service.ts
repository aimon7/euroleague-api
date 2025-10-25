import { Injectable } from '@nestjs/common';
import { EuroleagueHttpService } from 'src/core/euroleague-http.service';
import { CoachRecord } from './entities/coach-record.entity';

/**
 * Service responsible for handling coach-related operations.
 * Provides methods to retrieve coach information from the Euroleague API.
 */
@Injectable()
export class CoachesService {
  constructor(private readonly httpService: EuroleagueHttpService) {}

  /**
   * Retrieves detailed information about a specific coach.
   *
   * @param competitionCode - The code of the competition (e.g., 'E' for Euroleague)
   * @param seasonCode - The code of the season (e.g., 'E2025')
   * @param coachCode - The unique code identifying the coach (e.g., '001869')
   * @returns A promise that resolves to the coach's record containing detailed information
   * @throws {HttpException} If the coach is not found or the API request fails
   *
   * @example
   * ```typescript
   * const coach = await coachesService.getCoach('E', 'E2025', '001869');
   * ```
   */
  async getCoach(
    competitionCode: string,
    seasonCode: string,
    coachCode: string,
  ): Promise<CoachRecord> {
    return await this.httpService.get<CoachRecord>(
      `/v3/competitions/${competitionCode}/seasons/${seasonCode}/coaches/${coachCode}`,
    );
  }
}
