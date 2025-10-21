import { IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhaseType } from '../../common/enums/phase-type.enum';
import { Type } from 'class-transformer';

/**
 * Available standings endpoints/views
 */
export enum StandingsType {
  STANDARD = 'standings',
  STREAKS = 'standingsstreaks',
  MARGINS = 'standingsmargins',
  CALENDAR = 'standingscalendar',
}

/**
 * DTO for getting standings for a specific season
 */
export class GetStandingsDto {
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
    description: 'The round number to get standings for',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  round?: number;
}

/**
 * DTO for getting standings streaks (winning/losing streaks)
 */
export class GetStandingsStreaksDto extends GetStandingsDto {}

/**
 * DTO for getting standings margins (point differentials)
 */
export class GetStandingsMarginsDto extends GetStandingsDto {}

/**
 * DTO for getting standings calendar (results by round)
 */
export class GetStandingsCalendarDto extends GetStandingsDto {}
