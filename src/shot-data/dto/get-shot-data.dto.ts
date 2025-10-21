import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for getting shot data for a specific game
 */
export class GetShotDataDto {
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
    description: 'The game code',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  gameCode: number;
}

/**
 * DTO for getting shot data for multiple games in a season
 */
export class GetSeasonShotDataDto {
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
    description: 'The starting game code',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  startGameCode?: number;

  @ApiPropertyOptional({
    description: 'The ending game code',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  endGameCode?: number;
}
