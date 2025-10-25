import { ApiProperty } from '@nestjs/swagger';
import { Person } from 'src/persons/entities/person.entity';
import type { Nullable } from 'src/shared/types/nullable';
import { SeasonClub } from './season-club.entity';
import { CoachCompetitionRecord } from './coach-competition-record.entity';

export class CoachRecord {
  @ApiProperty({
    description: 'Coach person details',
    type: () => Person,
  })
  coach: Person;

  @ApiProperty({
    description: 'Current team details',
    type: () => SeasonClub,
  })
  team: SeasonClub;

  @ApiProperty({
    description: 'Competition records across all seasons',
    type: () => [CoachCompetitionRecord],
    nullable: true,
  })
  competitions: Nullable<CoachCompetitionRecord[]>;
}
