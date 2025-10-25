import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';
import { SeasonRecord } from './season-record.entity';

export class CoachCompetitionRecord {
  @ApiProperty({
    description: 'Competition name',
    example: 'Euroleague',
    nullable: true,
  })
  competitionName: Nullable<string>;

  @ApiProperty({
    description: 'Season records',
    type: () => [SeasonRecord],
    nullable: true,
  })
  seasons: Nullable<SeasonRecord[]>;
}
