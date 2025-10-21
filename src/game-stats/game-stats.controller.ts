import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GameStatsService } from './game-stats.service';
import {
  GetGameStatsDto,
  GetSeasonGameStatsDto,
  GetRoundGameStatsDto,
  GetRangeSeasonsGameStatsDto,
} from './dto/get-game-stats.dto';

/**
 * Controller for game statistics endpoints
 */
@ApiTags('Game Statistics')
@Controller('game-stats')
export class GameStatsController {
  constructor(private readonly gameStatsService: GameStatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get game statistics',
    description:
      'Retrieve statistics for a specific game by season and game code',
  })
  @ApiResponse({
    status: 200,
    description: 'Game statistics retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async getGameStats(
    @Query(new ValidationPipe({ transform: true })) query: GetGameStatsDto,
  ) {
    return this.gameStatsService.getGameStats(
      query.season,
      query.gameCode,
      query.endpoint,
    );
  }

  @Get('report')
  @ApiOperation({
    summary: 'Get game report',
    description: 'Retrieve the game report for a specific game',
  })
  @ApiResponse({
    status: 200,
    description: 'Game report retrieved successfully',
  })
  @ApiQuery({ name: 'season', type: Number, example: 2023 })
  @ApiQuery({ name: 'gameCode', type: Number, example: 1 })
  async getGameReport(
    @Query('season', new ValidationPipe({ transform: true })) season: number,
    @Query('gameCode', new ValidationPipe({ transform: true }))
    gameCode: number,
  ) {
    return this.gameStatsService.getGameReport(season, gameCode);
  }

  @Get('teams-comparison')
  @ApiOperation({
    summary: 'Get teams comparison',
    description: 'Retrieve teams comparison data for a specific game',
  })
  @ApiResponse({
    status: 200,
    description: 'Teams comparison retrieved successfully',
  })
  @ApiQuery({ name: 'season', type: Number, example: 2023 })
  @ApiQuery({ name: 'gameCode', type: Number, example: 1 })
  async getGameTeamsComparison(
    @Query('season', new ValidationPipe({ transform: true })) season: number,
    @Query('gameCode', new ValidationPipe({ transform: true }))
    gameCode: number,
  ) {
    return this.gameStatsService.getGameTeamsComparison(season, gameCode);
  }

  @Get('season')
  @ApiOperation({
    summary: 'Get season game statistics',
    description: 'Retrieve statistics for all games in a season',
  })
  @ApiResponse({
    status: 200,
    description: 'Season game statistics retrieved successfully',
  })
  async getSeasonGameStats(
    @Query(new ValidationPipe({ transform: true }))
    query: GetSeasonGameStatsDto,
  ) {
    return this.gameStatsService.getSeasonGameStats(
      query.season,
      query.endpoint,
    );
  }

  @Get('round')
  @ApiOperation({
    summary: 'Get round game statistics',
    description: 'Retrieve statistics for all games in a specific round',
  })
  @ApiResponse({
    status: 200,
    description: 'Round game statistics retrieved successfully',
  })
  async getRoundGameStats(
    @Query(new ValidationPipe({ transform: true }))
    query: GetRoundGameStatsDto,
  ) {
    return this.gameStatsService.getRoundGameStats(
      query.season,
      query.roundNumber,
      query.endpoint,
    );
  }

  @Get('range')
  @ApiOperation({
    summary: 'Get game statistics for a range of seasons',
    description: 'Retrieve statistics for all games across multiple seasons',
  })
  @ApiResponse({
    status: 200,
    description: 'Range seasons game statistics retrieved successfully',
  })
  async getRangeSeasonsGameStats(
    @Query(new ValidationPipe({ transform: true }))
    query: GetRangeSeasonsGameStatsDto,
  ) {
    return this.gameStatsService.getRangeSeasonsGameStats(
      query.startSeason,
      query.endSeason,
      query.endpoint,
    );
  }
}
