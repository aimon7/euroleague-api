import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SeasonMode } from 'src/common/enums/season-mode.enum';
import { SortDirection } from 'src/common/enums/sort-direction.enum';
import { Statistic } from 'src/common/enums/statistic.enum';
import { PhaseType } from '../../common/enums/phase-type.enum';
import { StatisticMode } from '../../common/enums/statistic-mode.enum';

/**
 * Available player stats endpoints
 */
export enum PlayerStatsEndpoint {
  TRADITIONAL = 'traditional',
  ADVANCED = 'advanced',
  MISC = 'misc',
  SCORING = 'scoring',
}

export class GetPlayerStatisticsDto {
  @ApiProperty({
    description: 'The type of player stats to fetch',
    enum: PlayerStatsEndpoint,
    default: PlayerStatsEndpoint.TRADITIONAL,
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
  })
  @IsOptional()
  @IsEnum(StatisticMode)
  statisticMode?: StatisticMode;

  @ApiPropertyOptional({
    description: 'The aggregation mode for statistics',
    enum: StatisticMode,
  })
  @IsOptional()
  @IsEnum(StatisticMode)
  statisticSortMode?: StatisticMode;

  @ApiPropertyOptional({
    description: 'The aggregation mode for statistics',
    enum: Statistic,
  })
  @IsOptional()
  @IsEnum(Statistic)
  statistic?: Statistic;

  @ApiPropertyOptional({
    description: 'The direction to sort the results',
    enum: SortDirection,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @ApiPropertyOptional({
    description: 'Offset for pagination of results',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    description: 'Limit the number of returned records',
    minimum: 1,
    default: 100,
  })
  @IsOptional()
  limit?: number;
}

/**
 * DTO for getting player stats for all seasons
 */
export class GetPlayerStatsAllSeasonsDto extends GetPlayerStatisticsDto {}

/**
 * DTO for getting player stats for a single season
 */
export class GetPlayerStatsSingleSeasonDto extends GetPlayerStatisticsDto {
  @ApiProperty({
    description: 'The season code representing the season (e.g., E2025)',
    example: 'E2025',
  })
  @IsString()
  SeasonCode: string;
}

/**
 * DTO for getting player stats for a range of seasons
 */
export class GetPlayerStatsRangeSeasonsDto extends GetPlayerStatisticsDto {
  @ApiProperty({
    description: 'The starting season code for the range (e.g., E2020)',
    example: 'E2020',
  })
  @IsString()
  FromSeasonCode: string;

  @ApiProperty({
    description: 'The ending season code for the range (e.g., E2025)',
    example: 'E2025',
  })
  @IsString()
  ToSeasonCode: string;
}

/**
 * DTO for getting player stats leaders
 */
export class GetPlayerStatsLeadersDto {
  @ApiPropertyOptional({
    description: 'The season mode for the statistic leaders',
    enum: SeasonMode,
  })
  @IsOptional()
  @IsEnum(SeasonMode)
  SeasonMode?: SeasonMode;

  @ApiPropertyOptional({
    description: 'The season code representing the season (e.g., E2025)',
    example: 'E2025',
  })
  @IsOptional()
  SeasonCode?: string;

  @ApiPropertyOptional({
    description: 'The starting season code for the range (e.g., E2020)',
    example: 'E2020',
  })
  @IsOptional()
  FromSeasonCode?: string;

  @ApiPropertyOptional({
    description: 'The ending season code for the range (e.g., E2025)',
    example: 'E2025',
  })
  @IsOptional()
  ToSeasonCode?: string;

  @ApiPropertyOptional({
    description: 'The team code representing the team (e.g., OLY)',
    example: 'OLY',
  })
  @IsOptional()
  teamCode?: string;

  @ApiPropertyOptional({
    description: 'Limit the number of returned records',
    minimum: 1,
    example: 100,
  })
  @IsOptional()
  limit?: number;
}
