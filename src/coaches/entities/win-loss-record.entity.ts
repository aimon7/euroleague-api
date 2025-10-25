import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';

export class WinLossRecord {
  @ApiProperty({
    description: 'Win-loss record string',
    example: '22-9',
    nullable: true,
  })
  winLossRecord: Nullable<string>;

  @ApiProperty({
    description: 'Win-loss percentage',
    example: '70.97%',
    nullable: true,
  })
  winLossPercentage: Nullable<string>;
}
