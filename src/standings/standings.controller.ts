import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandingsService } from './standings.service';
import {
  GetStandingsDto,
  GetStandingsStreaksDto,
  GetStandingsMarginsDto,
  GetStandingsCalendarDto,
} from './dto/get-standings.dto';

@ApiTags('Standings')
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get('standard')
  @ApiOperation({ summary: 'Get standard standings for a season' })
  @ApiResponse({
    status: 200,
    description: 'Returns standard standings data',
  })
  async getStandardStandings(@Query() dto: GetStandingsDto) {
    return await this.standingsService.getStandardStandings(dto);
  }

  @Get('streaks')
  @ApiOperation({ summary: 'Get standings with win/loss streaks' })
  @ApiResponse({
    status: 200,
    description: 'Returns standings with streak information',
  })
  async getStandingsStreaks(@Query() dto: GetStandingsStreaksDto) {
    return await this.standingsService.getStandingsStreaks(dto);
  }

  @Get('margins')
  @ApiOperation({ summary: 'Get standings with point margins/differentials' })
  @ApiResponse({
    status: 200,
    description: 'Returns standings with point differential information',
  })
  async getStandingsMargins(@Query() dto: GetStandingsMarginsDto) {
    return await this.standingsService.getStandingsMargins(dto);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get standings calendar (results by round)' })
  @ApiResponse({
    status: 200,
    description: 'Returns standings calendar with round-by-round results',
  })
  async getStandingsCalendar(@Query() dto: GetStandingsCalendarDto) {
    return await this.standingsService.getStandingsCalendar(dto);
  }
}
