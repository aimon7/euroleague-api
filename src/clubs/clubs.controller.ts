import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Nullable } from 'src/shared/types/nullable';
import { ClubsService } from './clubs.service';
import { GetAllRegisteredClubsParamsDto } from './dto/get-all-registered-clubs-params.dto';
import { PaginatedClubResponseDto } from './dto/paginated-club-response.dto';
import { Club } from './entities/club.entity';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get all registered clubs',
    description: 'Returns a paginated list of all registered clubs',
  })
  @ApiResponse({
    status: 200,
    description: 'Clubs data retrieved successfully',
    type: PaginatedClubResponseDto,
  })
  async getAllRegisteredClubs(
    @Query() query: GetAllRegisteredClubsParamsDto,
  ): Promise<PaginatedClubResponseDto> {
    return await this.clubsService.getAllRegisteredClubs(query);
  }

  @Get(':clubCode')
  @ApiOperation({
    summary: 'Get club by code',
    description: 'Returns the details of a club by its code',
  })
  @ApiParam({
    name: 'clubCode',
    description: 'The unique code of the club',
    example: 'OLY',
  })
  @ApiResponse({
    status: 200,
    description: 'Club data retrieved successfully',
    type: Club,
  })
  @ApiNotFoundResponse({
    description: 'Club not found with the provided code',
  })
  async getClubByCode(@Param('clubCode') clubCode: string): Promise<Club> {
    return await this.clubsService.getClubByCode(clubCode);
  }

  @Get(':clubCode/info')
  @ApiOperation({
    summary: 'Get club information',
    description: 'Returns detailed information about a club',
  })
  @ApiParam({
    name: 'clubCode',
    description: 'The unique code of the club',
    example: 'OLY',
  })
  @ApiResponse({
    status: 200,
    description: 'Club information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        info: { type: 'string', nullable: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Club not found',
  })
  async getClubInfo(
    @Param('clubCode') clubCode: string,
  ): Promise<{ info: Nullable<string> }> {
    return await this.clubsService.getClubInfo(clubCode);
  }
}
