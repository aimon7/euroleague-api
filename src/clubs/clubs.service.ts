import { Injectable, NotFoundException } from '@nestjs/common';
import { EuroleagueHttpService } from 'src/core/euroleague-http.service';
import { GetAllRegisteredClubsParamsDto } from './dto/get-all-registered-clubs-params.dto';
import { PaginatedClubResponseDto } from './dto/paginated-club-response.dto';
import { Club } from './entities/club.entity';

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

  async getClubByCode(code: string): Promise<Club> {
    try {
      const club = await this.httpService.get<Club>(`/v3/clubs/${code}`);
      return club;
    } catch (error) {
      throw new NotFoundException({
        description: `Club not found with the provided code: ${code}`,
        cause: JSON.stringify(error),
      });
    }
  }
}
