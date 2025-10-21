import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamStatsService } from './team-stats.service';
import {
  GetTeamStatsAllSeasonsDto,
  GetTeamStatsSingleSeasonDto,
  GetTeamStatsRangeSeasonsDto,
} from './dto/get-team-stats.dto';

@ApiTags('team-stats')
@Controller('team-stats')
export class TeamStatsController {
  constructor(private readonly teamStatsService: TeamStatsService) {}

  @Get('all-seasons')
  @ApiOperation({ summary: 'Get team statistics for all seasons' })
  @ApiResponse({
    status: 200,
    description: 'Returns team statistics for all seasons',
  })
  async getTeamStatsAllSeasons(@Query() dto: GetTeamStatsAllSeasonsDto) {
    return await this.teamStatsService.getTeamStatsAllSeasons(dto);
  }

  @Get('single-season')
  @ApiOperation({ summary: 'Get team statistics for a single season' })
  @ApiResponse({
    status: 200,
    description: 'Returns team statistics for a single season',
  })
  async getTeamStatsSingleSeason(@Query() dto: GetTeamStatsSingleSeasonDto) {
    return await this.teamStatsService.getTeamStatsSingleSeason(dto);
  }

  @Get('range-seasons')
  @ApiOperation({ summary: 'Get team statistics for a range of seasons' })
  @ApiResponse({
    status: 200,
    description: 'Returns team statistics for a range of seasons',
  })
  async getTeamStatsRangeSeasons(@Query() dto: GetTeamStatsRangeSeasonsDto) {
    return await this.teamStatsService.getTeamStatsRangeSeasons(dto);
  }
}
