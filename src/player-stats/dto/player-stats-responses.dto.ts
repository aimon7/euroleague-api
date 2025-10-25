import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class PlayersTraditionalStats {
  @ApiProperty({
    description: 'Total number of players',
    example: 150,
  })
  @IsInt()
  total: number;

  players: any[];
}
