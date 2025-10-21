import { IsInt, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Game stats endpoint types
 */
export enum GameStatsEndpoint {
  REPORT = 'report',
  STATS = 'stats',
  TEAMS_COMPARISON = 'teamsComparison',
}

/**
 * DTO for getting game statistics
 */
export class GetGameStatsDto {
  @ApiProperty({
    description: 'The start year of the season',
    example: 2023,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  season: number;

  @ApiProperty({
    description: 'The game code (can be found on Euroleague website)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  gameCode: number;

  @ApiPropertyOptional({
    description: 'The type of game data to retrieve',
    enum: GameStatsEndpoint,
    default: GameStatsEndpoint.STATS,
  })
  @IsEnum(GameStatsEndpoint)
  @IsOptional()
  endpoint?: GameStatsEndpoint = GameStatsEndpoint.STATS;
}

/**
 * DTO for getting game stats for a season
 */
export class GetSeasonGameStatsDto {
  @ApiProperty({
    description: 'The start year of the season',
    example: 2023,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  season: number;

  @ApiPropertyOptional({
    description: 'The type of game data to retrieve',
    enum: GameStatsEndpoint,
    default: GameStatsEndpoint.STATS,
  })
  @IsEnum(GameStatsEndpoint)
  @IsOptional()
  endpoint?: GameStatsEndpoint = GameStatsEndpoint.STATS;
}

/**
 * DTO for getting game stats for a round
 */
export class GetRoundGameStatsDto {
  @ApiProperty({
    description: 'The start year of the season',
    example: 2023,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  season: number;

  @ApiProperty({
    description: 'The round number',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  roundNumber: number;

  @ApiPropertyOptional({
    description: 'The type of game data to retrieve',
    enum: GameStatsEndpoint,
    default: GameStatsEndpoint.STATS,
  })
  @IsEnum(GameStatsEndpoint)
  @IsOptional()
  endpoint?: GameStatsEndpoint = GameStatsEndpoint.STATS;
}

/**
 * DTO for getting game stats for a range of seasons
 */
export class GetRangeSeasonsGameStatsDto {
  @ApiProperty({
    description: 'The start year of the first season',
    example: 2020,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  startSeason: number;

  @ApiProperty({
    description: 'The start year of the last season',
    example: 2023,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  endSeason: number;

  @ApiPropertyOptional({
    description: 'The type of game data to retrieve',
    enum: GameStatsEndpoint,
    default: GameStatsEndpoint.STATS,
  })
  @IsEnum(GameStatsEndpoint)
  @IsOptional()
  endpoint?: GameStatsEndpoint = GameStatsEndpoint.STATS;
}
