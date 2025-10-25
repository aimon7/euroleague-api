import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';
import { WinLossRecord } from './win-loss-record.entity';

export class SeasonRecord {
  @ApiProperty({
    description: 'Competition years',
    example: '2012-13',
    nullable: true,
  })
  competitionYears: Nullable<string>;

  @ApiProperty({
    description: 'Team name for this season',
    example: 'Olympiacos Piraeus',
    nullable: true,
  })
  teamName: Nullable<string>;

  @ApiProperty({
    description: 'Win-loss record for this season',
    type: () => WinLossRecord,
    nullable: true,
  })
  winLossRecord: Nullable<WinLossRecord>;
}
