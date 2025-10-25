import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';

/**
 * Team information for a player leader
 */
export class Team {
  @ApiProperty({
    description: 'Team code(s), separated by semicolons if multiple teams',
    example: 'PER;OLY;SIE',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'TV code(s), separated by semicolons if multiple teams',
    example: 'PER;OLY;MPS',
    nullable: true,
  })
  tvCodes: Nullable<string>;

  @ApiProperty({
    description: 'Team name(s), separated by semicolons if multiple teams',
    example: 'Peristeri BC;Olympiacos Piraeus;Montepaschi Siena',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiProperty({
    description: 'Team image URL(s), separated by semicolons if multiple teams',
    example:
      'https://media-cdn.incrowdsports.com/743fd646-dc10-4a04-a90f-952e33a143a4.png;https://media-cdn.incrowdsports.com/789423ac-3cdf-4b89-b11c-b458aa5f59a6.png;https://media-cdn.incrowdsports.com/1d94a55f-b8c7-459c-951e-8177f5f3eebe.png',
    nullable: true,
  })
  imageUrl: Nullable<string>;
}

/**
 * Player details for a leader entry
 */
export class PlayerLeader {
  @ApiProperty({
    description: 'Player unique code/identifier',
    example: '012774',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Player full name in uppercase',
    example: 'NUNN, KENDRICK',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiProperty({
    description: 'Player age',
    example: 30,
    nullable: true,
  })
  age: Nullable<number>;

  @ApiProperty({
    description: 'Player position',
    example: 'Guard',
    nullable: true,
  })
  position: Nullable<string>;

  @ApiProperty({
    description: 'Player image URL',
    example:
      'https://media-cdn.cortextech.io/6a45d41a-03f4-482a-b7ed-40adc56d5af8.png',
    nullable: true,
  })
  imageUrl: Nullable<string>;

  @ApiProperty({
    description: 'Team information',
    type: () => Team,
  })
  team: Team;
}

/**
 * Leader item for statistics with rank, games played, and average
 */
export class PlayerLeaderModelLeadersItem {
  @ApiProperty({
    description: 'Player details',
    type: () => PlayerLeader,
  })
  details: PlayerLeader;

  @ApiProperty({
    description: 'Rank position in the leaderboard',
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: 'Number of games played',
    example: 54,
  })
  gamesPlayed: number;

  @ApiProperty({
    description: 'Statistical average value',
    example: 22.22222222222222,
  })
  average: number;
}

/**
 * Leader item for percentage statistics with rank and value
 */
export class PlayerLeaderModelLeadersPercentageItem {
  @ApiProperty({
    description: 'Player details',
    type: () => PlayerLeader,
  })
  details: PlayerLeader;

  @ApiProperty({
    description: 'Rank position in the leaderboard',
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: 'Percentage value as a string',
    example: '74.2%',
    nullable: true,
  })
  value: Nullable<string>;
}

/**
 * Complete player leaders model containing all statistical categories
 */
export class PlayerLeaderLeaders {
  @ApiProperty({
    description: 'Points leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  points: Nullable<PlayerLeaderModelLeadersItem[]>;

  @ApiProperty({
    description: 'Rebounds leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  rebounds: Nullable<PlayerLeaderModelLeadersItem[]>;

  @ApiProperty({
    description: 'Assists leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  assists: Nullable<PlayerLeaderModelLeadersItem[]>;

  @ApiProperty({
    description: 'Steals leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  steals: Nullable<PlayerLeaderModelLeadersItem[]>;

  @ApiProperty({
    description: 'Blocks leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  blocks: Nullable<PlayerLeaderModelLeadersItem[]>;

  @ApiProperty({
    description: 'PIR (Performance Index Rating) leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  pir: Nullable<PlayerLeaderModelLeadersItem[]>;

  @ApiProperty({
    description: 'Two-point field goal percentage leaders',
    type: [PlayerLeaderModelLeadersPercentageItem],
    nullable: true,
  })
  twoPointersPercentage: Nullable<PlayerLeaderModelLeadersPercentageItem[]>;

  @ApiProperty({
    description: 'Three-point field goal percentage leaders',
    type: [PlayerLeaderModelLeadersPercentageItem],
    nullable: true,
  })
  threePointersPercentage: Nullable<PlayerLeaderModelLeadersPercentageItem[]>;

  @ApiProperty({
    description: 'Free throw percentage leaders',
    type: [PlayerLeaderModelLeadersPercentageItem],
    nullable: true,
  })
  freeThrowsPercentage: Nullable<PlayerLeaderModelLeadersPercentageItem[]>;

  @ApiProperty({
    description: 'Offensive rebounds leaders',
    type: [PlayerLeaderModelLeadersItem],
    nullable: true,
  })
  offensiveRebounds: Nullable<PlayerLeaderModelLeadersItem[]>;
}
