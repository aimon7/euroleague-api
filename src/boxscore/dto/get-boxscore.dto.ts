import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

/**
 * DTO for retrieving boxscore data for a specific game
 */
export class GetBoxscoreDto {
  @ApiProperty({
    description: 'The season code (e.g., 2023 for 2023-24 season)',
    example: 2023,
  })
  @IsInt()
  season: number;

  @ApiProperty({
    description: 'The game code (e.g., 1 for game 1 of the season)',
    example: 1,
  })
  @IsInt()
  gameCode: number;
}

/**
 * DTO for retrieving boxscore data for multiple games in a season with optional range filtering
 */
export class GetSeasonBoxscoreDto {
  @ApiProperty({
    description: 'The season code (e.g., 2023 for 2023-24 season)',
    example: 2023,
  })
  @IsInt()
  season: number;

  @ApiProperty({
    description:
      'Starting game code (optional, if omitted returns all games from the beginning of the season)',
    example: 1,
    required: false,
  })
  @IsInt()
  startGameCode?: number;

  @ApiProperty({
    description:
      'Ending game code (optional, if omitted returns all games up to the latest)',
    example: 10,
    required: false,
  })
  @IsInt()
  endGameCode?: number;
}
