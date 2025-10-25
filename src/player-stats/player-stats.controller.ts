import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Competition } from 'src/common/enums/competition.enum';
import {
  GetPlayerStatsAllSeasonsDto,
  GetPlayerStatsRangeSeasonsDto,
  GetPlayerStatsSingleSeasonDto,
} from './dto/get-player-stats.dto';
import { PlayerStatsService } from './player-stats.service';

@ApiTags('Player Statistics')
@Controller('player-stats')
export class PlayerStatsController {
  constructor(private readonly playerStatsService: PlayerStatsService) {}

  @Get('all-seasons/:competitionCode')
  @ApiOperation({ summary: 'Get player statistics for all seasons' })
  @ApiParam({
    name: 'competitionCode',
    description: 'The competition code (e.g., E = EUROLEAGUE, U = EUROCUP)',
    enum: Competition,
    example: Competition.EUROLEAGUE,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns player statistics for all seasons',
  })
  async getPlayerStatsAllSeasons(
    @Param('competitionCode') competitionCode: Competition,
    @Query() dto: GetPlayerStatsAllSeasonsDto,
  ) {
    return await this.playerStatsService.getPlayerStatsAllSeasons(
      competitionCode,
      dto,
    );
  }

  @Get('single-season/:competitionCode')
  @ApiOperation({ summary: 'Get player statistics for a single season' })
  @ApiParam({
    name: 'competitionCode',
    description: 'The competition code (e.g., E = EUROLEAGUE, U = EUROCUP)',
    enum: Competition,
    example: Competition.EUROLEAGUE,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns player statistics for a single season',
  })
  async getPlayerStatsSingleSeason(
    @Param('competitionCode') competitionCode: Competition,
    @Query() dto: GetPlayerStatsSingleSeasonDto,
  ) {
    return await this.playerStatsService.getPlayerStatsSingleSeason(
      competitionCode,
      dto,
    );
  }

  @Get('range-seasons/:competitionCode')
  @ApiOperation({ summary: 'Get player statistics for a range of seasons' })
  @ApiParam({
    name: 'competitionCode',
    description: 'The competition code (e.g., E = EUROLEAGUE, U = EUROCUP)',
    enum: Competition,
    example: Competition.EUROLEAGUE,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns player statistics for a range of seasons',
  })
  async getPlayerStatsRangeSeasons(
    @Param('competitionCode') competitionCode: Competition,
    @Query() dto: GetPlayerStatsRangeSeasonsDto,
  ) {
    return await this.playerStatsService.getPlayerStatsRangeSeasons(
      competitionCode,
      dto,
    );
  }

  // @Get('leaders/:season')
  // @ApiOperation({
  //   summary: 'Get player leaders (top performers) for a specific season',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns player leaders for the specified season',
  // })
  // async getPlayerStatsLeaders(
  //   @Param('season', ParseIntPipe) season: number,
  //   @Query() dto: GetPlayerStatsLeadersDto,
  // ) {
  //   return await this.playerStatsService.getPlayerStatsLeaders(season, dto);
  // }

  // @Get('leaders/all-seasons')
  // @ApiOperation({
  //   summary: 'Get player leaders (top performers) for all seasons',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns player leaders for all seasons',
  // })
  // async getPlayerStatsLeadersAllSeasons(
  //   @Query() dto: GetPlayerStatsLeadersDto,
  // ) {
  //   return await this.playerStatsService.getPlayerStatsLeadersAllSeasons(dto);
  // }
}
