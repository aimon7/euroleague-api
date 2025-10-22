import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayerStatsService } from './player-stats.service';
import {
  GetPlayerStatsAllSeasonsDto,
  GetPlayerStatsSingleSeasonDto,
  GetPlayerStatsRangeSeasonsDto,
  GetPlayerStatsLeadersDto,
} from './dto/get-player-stats.dto';

@ApiTags('Player Statistics')
@Controller('player-stats')
export class PlayerStatsController {
  constructor(private readonly playerStatsService: PlayerStatsService) {}

  @Get('all-seasons')
  @ApiOperation({ summary: 'Get player statistics for all seasons' })
  @ApiResponse({
    status: 200,
    description: 'Returns player statistics for all seasons',
  })
  async getPlayerStatsAllSeasons(@Query() dto: GetPlayerStatsAllSeasonsDto) {
    return await this.playerStatsService.getPlayerStatsAllSeasons(dto);
  }

  @Get('single-season')
  @ApiOperation({ summary: 'Get player statistics for a single season' })
  @ApiResponse({
    status: 200,
    description: 'Returns player statistics for a single season',
  })
  async getPlayerStatsSingleSeason(
    @Query() dto: GetPlayerStatsSingleSeasonDto,
  ) {
    return await this.playerStatsService.getPlayerStatsSingleSeason(dto);
  }

  @Get('range-seasons')
  @ApiOperation({ summary: 'Get player statistics for a range of seasons' })
  @ApiResponse({
    status: 200,
    description: 'Returns player statistics for a range of seasons',
  })
  async getPlayerStatsRangeSeasons(
    @Query() dto: GetPlayerStatsRangeSeasonsDto,
  ) {
    return await this.playerStatsService.getPlayerStatsRangeSeasons(dto);
  }

  @Get('leaders/:season')
  @ApiOperation({
    summary: 'Get player leaders (top performers) for a specific season',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns player leaders for the specified season',
  })
  async getPlayerStatsLeaders(
    @Param('season', ParseIntPipe) season: number,
    @Query() dto: GetPlayerStatsLeadersDto,
  ) {
    return await this.playerStatsService.getPlayerStatsLeaders(season, dto);
  }

  @Get('leaders/all-seasons')
  @ApiOperation({
    summary: 'Get player leaders (top performers) for all seasons',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns player leaders for all seasons',
  })
  async getPlayerStatsLeadersAllSeasons(
    @Query() dto: GetPlayerStatsLeadersDto,
  ) {
    return await this.playerStatsService.getPlayerStatsLeadersAllSeasons(dto);
  }
}
