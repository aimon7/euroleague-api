import { IsInt, IsOptional, IsEnum, Min, Max, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhaseType } from '../../common/enums/phase-type.enum';
import { StatisticMode } from '../../common/enums/statistic-mode.enum';
import { Type } from 'class-transformer';

/**
 * Available team stats endpoints
 */
export enum TeamStatsEndpoint {
  TRADITIONAL = 'traditional',
  ADVANCED = 'advanced',
  OPPONENT = 'opponents',
  OPPONENT_ADVANCED = 'opponentsadvanced',
}

/**
 * DTO for getting team stats for a single season
 */
export class GetTeamStatsSingleSeasonDto {
  @ApiProperty({
    description: 'The type of team stats to fetch',
    enum: TeamStatsEndpoint,
    example: TeamStatsEndpoint.TRADITIONAL,
  })
  @IsEnum(TeamStatsEndpoint)
  endpoint: TeamStatsEndpoint;

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
    description: 'The phase of the season',
    enum: PhaseType,
    example: PhaseType.REGULAR_SEASON,
  })
  @IsOptional()
  @IsEnum(PhaseType)
  phaseTypeCode?: PhaseType;

  @ApiPropertyOptional({
    description: 'The aggregation mode for statistics',
    enum: StatisticMode,
    example: StatisticMode.PER_GAME,
    default: StatisticMode.PER_GAME,
  })
  @IsOptional()
  @IsEnum(StatisticMode)
  statisticMode?: StatisticMode = StatisticMode.PER_GAME;
}

/**
 * DTO for getting team stats for all seasons
 */
export class GetTeamStatsAllSeasonsDto {
  @ApiProperty({
    description: 'The type of team stats to fetch',
    enum: TeamStatsEndpoint,
    example: TeamStatsEndpoint.TRADITIONAL,
  })
  @IsEnum(TeamStatsEndpoint)
  endpoint: TeamStatsEndpoint;

  @ApiPropertyOptional({
    description: 'The phase of the season',
    enum: PhaseType,
  })
  @IsOptional()
  @IsEnum(PhaseType)
  phaseTypeCode?: PhaseType;

  @ApiPropertyOptional({
    description: 'The aggregation mode for statistics',
    enum: StatisticMode,
    default: StatisticMode.PER_GAME,
  })
  @IsOptional()
  @IsEnum(StatisticMode)
  statisticMode?: StatisticMode = StatisticMode.PER_GAME;
}

/**
 * DTO for getting team stats for a range of seasons
 */
export class GetTeamStatsRangeSeasonsDto {
  @ApiProperty({
    description: 'The type of team stats to fetch',
    enum: TeamStatsEndpoint,
    example: TeamStatsEndpoint.TRADITIONAL,
  })
  @IsEnum(TeamStatsEndpoint)
  endpoint: TeamStatsEndpoint;

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
    description: 'The phase of the season',
    enum: PhaseType,
  })
  @IsOptional()
  @IsEnum(PhaseType)
  phaseTypeCode?: PhaseType;

  @ApiPropertyOptional({
    description: 'The aggregation mode for statistics',
    enum: StatisticMode,
    default: StatisticMode.PER_GAME,
  })
  @IsOptional()
  @IsEnum(StatisticMode)
  statisticMode?: StatisticMode = StatisticMode.PER_GAME;
}
