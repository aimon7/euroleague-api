import { Injectable } from '@nestjs/common';
import { EuroleagueHttpService } from 'src/core/euroleague-http.service';
import { CoachRecord } from './entities/coach-record.entity';

@Injectable()
export class CoachesService {
  constructor(private readonly httpService: EuroleagueHttpService) {}

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
