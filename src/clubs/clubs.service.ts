import { Injectable } from '@nestjs/common';
import { EuroleagueHttpService } from 'src/core/euroleague-http.service';
import { GetAllRegisteredClubsParamsDto } from './dto/get-all-registered-clubs-params.dto';
import { PaginatedClubResponseDto } from './dto/paginated-club-response.dto';
import { Club } from './entities/club.entity';
import { Nullable } from 'src/shared/types/nullable';

@Injectable()
export class ClubsService {
  constructor(private readonly httpService: EuroleagueHttpService) {}

  async getAllRegisteredClubs(
    params: GetAllRegisteredClubsParamsDto,
  ): Promise<PaginatedClubResponseDto> {
    let paramsString = '';
    if (params.limit) {
      paramsString += `limit=${params.limit}&`;
    }
    if (params.offset) {
      paramsString += `offset=${params.offset}&`;
    }
    if (params.hasParentClub) {
      paramsString += `hasParentClub=${params.hasParentClub}&`;
    }
    if (params.search) {
      paramsString += `search=${params.search}&`;
    }
    paramsString = paramsString.slice(0, -1); // Remove trailing '&'

    return await this.httpService.get(
      `/v3/clubs${paramsString ? `?${paramsString}` : ''}`,
    );
  }

  async getClubByCode(clubCode: string): Promise<Club> {
    return await this.httpService.get<Club>(`/v3/clubs/${clubCode}`);
  }

  async getClubInfo(clubCode: string): Promise<{ info: Nullable<string> }> {
    return await this.httpService.get<{ info: Nullable<string> }>(
      `/v3/clubs/${clubCode}/info`,
    );
  }
}
