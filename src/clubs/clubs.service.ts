import { Injectable } from '@nestjs/common';
import { EuroleagueHttpService } from 'src/core/euroleague-http.service';
import { GetAllRegisteredClubsParamsDto } from './dto/get-all-registered-clubs-params.dto';
import { PaginatedClubResponseDto } from './dto/paginated-club-response.dto';
import { Club } from './entities/club.entity';
import { Nullable } from 'src/shared/types/nullable';

/**
 * Service responsible for handling club-related operations.
 * Provides methods to retrieve club information from the Euroleague API.
 */
@Injectable()
export class ClubsService {
  constructor(private readonly httpService: EuroleagueHttpService) {}

  /**
   * Retrieves a paginated list of all registered clubs.
   *
   * @param params - Query parameters for filtering and pagination
   * @param params.limit - Maximum number of clubs to return per page
   * @param params.offset - Number of clubs to skip for pagination
   * @param params.hasParentClub - Filter clubs by parent club relationship
   * @param params.search - Search term to filter clubs by name or code
   * @returns A promise that resolves to a paginated response containing clubs data
   * @throws {HttpException} If the API request fails
   *
   * @example
   * ```typescript
   * const clubs = await clubsService.getAllRegisteredClubs({
   *   limit: 10,
   *   offset: 0,
   *   search: 'Olympiacos'
   * });
   * ```
   */
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

  /**
   * Retrieves detailed information about a specific club by its code.
   *
   * @param clubCode - The unique code identifying the club (e.g., 'OLY' for Olympiacos)
   * @returns A promise that resolves to the club's detailed information
   * @throws {HttpException} If the club is not found or the API request fails
   *
   * @example
   * ```typescript
   * const club = await clubsService.getClubByCode('OLY');
   * ```
   */
  async getClubByCode(clubCode: string): Promise<Club> {
    return await this.httpService.get<Club>(`/v3/clubs/${clubCode}`);
  }

  /**
   * Retrieves additional information text about a specific club.
   *
   * @param clubCode - The unique code identifying the club (e.g., 'OLY')
   * @returns A promise that resolves to an object containing the club's info text (may be null)
   * @throws {HttpException} If the club is not found or the API request fails
   *
   * @example
   * ```typescript
   * const { info } = await clubsService.getClubInfo('OLY');
   * console.log(info); // Additional club information or null
   * ```
   */
  async getClubInfo(clubCode: string): Promise<{ info: Nullable<string> }> {
    return await this.httpService.get<{ info: Nullable<string> }>(
      `/v3/clubs/${clubCode}/info`,
    );
  }
}
