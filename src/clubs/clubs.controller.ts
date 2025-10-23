import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { GetAllRegisteredClubsParamsDto } from './dto/get-all-registered-clubs-params.dto';
import { PaginatedClubResponseDto } from './dto/paginated-club-response.dto';
import { Club } from './entities/club.entity';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get('all-registered-clubs')
  @ApiOperation({
    summary: 'Get all registered clubs',
    description: 'Returns a paginated list of all registered clubs',
  })
  @ApiResponse({
    status: 200,
    description: 'Clubs data retrieved successfully',
  })
  async getAllRegisteredClubs(
    @Query() query: GetAllRegisteredClubsParamsDto,
  ): Promise<PaginatedClubResponseDto> {
    return await this.clubsService.getAllRegisteredClubs(query);
  }

  @Get('club-by-code')
  @ApiOperation({
    summary: 'Get club by code',
    description: 'Returns the details of a club by its code',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'The unique code of the club',
  })
  @ApiResponse({
    status: 200,
    description: 'Club data retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Club not found with the provided code',
  })
  async getClubByCode(@Query('code') code: string): Promise<Club> {
    return await this.clubsService.getClubByCode(code);
  }
}
