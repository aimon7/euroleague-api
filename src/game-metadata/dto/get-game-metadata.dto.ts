import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

/**
 * DTO for retrieving game metadata (stadium, referees, attendance, etc.)
 */
export class GetGameMetadataDto {
  @ApiProperty({
    description: 'The season code (e.g., 2023 for 2023-24 season)',
    example: 2023,
  })
  @Type(() => Number)
  @IsInt()
  season: number;

  @ApiProperty({
    description: 'The game code (e.g., 1 for game 1 of the season)',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  gameCode: number;
}
