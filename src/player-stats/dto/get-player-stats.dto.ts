import {
  IsInt,
  IsOptional,
  IsEnum,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhaseType } from '../../common/enums/phase-type.enum';
import { StatisticMode } from '../../common/enums/statistic-mode.enum';
import { Type } from 'class-transformer';

/**
 * Available player stats endpoints
 */
export enum PlayerStatsEndpoint {
  TRADITIONAL = 'traditional',
  ADVANCED = 'advanced',
  MISC = 'misc',
  SCORING = 'scoring',
}

/**
 * DTO for getting player stats for a single season
 */
export class GetPlayerStatsSingleSeasonDto {
  @ApiProperty({
    description: 'The type of player stats to fetch',
    enum: PlayerStatsEndpoint,
    example: PlayerStatsEndpoint.TRADITIONAL,
  })
  @IsEnum(PlayerStatsEndpoint)
  endpoint: PlayerStatsEndpoint;

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
 * DTO for getting player stats for all seasons
 */
export class GetPlayerStatsAllSeasonsDto {
  @ApiProperty({
    description: 'The type of player stats to fetch',
    enum: PlayerStatsEndpoint,
    example: PlayerStatsEndpoint.TRADITIONAL,
  })
  @IsEnum(PlayerStatsEndpoint)
  endpoint: PlayerStatsEndpoint;

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
 * DTO for getting player stats for a range of seasons
 */
export class GetPlayerStatsRangeSeasonsDto {
  @ApiProperty({
    description: 'The type of player stats to fetch',
    enum: PlayerStatsEndpoint,
    example: PlayerStatsEndpoint.TRADITIONAL,
  })
  @IsEnum(PlayerStatsEndpoint)
  endpoint: PlayerStatsEndpoint;

  @ApiProperty({
    description: 'The start year of the first season in the range',
    example: 2020,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  startSeason: number;

  @ApiProperty({
    description: 'The start year of the last season in the range',
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

/**
 * Available stat categories for player leaders
 */
export const STAT_CATEGORIES = [
  'Valuation',
  'Score',
  'TotalRebounds',
  'OffensiveRebounds',
  'Assistances',
  'Steals',
  'BlocksFavour',
  'BlocksAgainst',
  'Turnovers',
  'FoulsReceived',
  'FoulsCommited',
  'FreeThrowsMade',
  'FreeThrowsAttempted',
  'FreeThrowsPercent',
  'FieldGoalsMade2',
  'FieldGoalsAttempted2',
  'FieldGoals2Percent',
  'FieldGoalsMade3',
  'FieldGoalsAttempted3',
  'FieldGoals3Percent',
  'FieldGoalsMadeTotal',
  'FieldGoalsAttemptedTotal',
  'FieldGoalsPercent',
] as const;

/**
 * DTO for getting player stats leaders
 */
export class GetPlayerStatsLeadersDto {
  @ApiProperty({
    description: 'The statistical category for ranking players',
    example: 'Score',
    enum: STAT_CATEGORIES,
  })
  @IsString()
  @IsIn(STAT_CATEGORIES)
  statCategory: string;

  @ApiPropertyOptional({
    description: 'Number of top players to return',
    example: 200,
    default: 200,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  topN?: number = 200;

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
