import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';

export class SeasonClub {
  @ApiProperty({
    description: 'Club code',
    example: 'OLY',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Club full name',
    example: 'Olympiacos Piraeus',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiProperty({
    description: 'Club abbreviated name',
    example: 'Olympiacos',
    nullable: true,
  })
  abbreviatedName: Nullable<string>;

  @ApiProperty({
    description: 'Club editorial name',
    example: 'Olympiacos',
    nullable: true,
  })
  editorialName: Nullable<string>;

  @ApiProperty({
    description: 'TV broadcast code',
    example: 'OLY',
    nullable: true,
  })
  tvCode: Nullable<string>;

  @ApiProperty({
    description: 'Whether the club is virtual',
    example: false,
  })
  isVirtual: boolean;

  @ApiProperty({
    description: 'Club images by type',
    example: {
      crest:
        'https://media-cdn.incrowdsports.com/789423ac-3cdf-4b89-b11c-b458aa5f59a6.png',
    },
    nullable: true,
  })
  images: Nullable<{ [key: string]: string }>;
}
