import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';
import { Country } from './country.entity';
import { Venue } from './venue.entity';

export class Club {
  @ApiProperty({
    description: 'Club code',
    example: 'BAR',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Club name',
    example: 'FC Barcelona',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiProperty({
    description: 'Club alias',
    example: 'Barcelona',
    nullable: true,
  })
  alias: Nullable<string>;

  @ApiProperty({
    description: 'Whether the club is virtual',
    example: false,
  })
  isVirtual: boolean;

  @ApiProperty({
    description: 'Club country',
    type: () => Country,
  })
  country: Country;

  @ApiPropertyOptional({
    description: 'Club address',
    example: "C. d'Aristides Maillol, s/n",
    nullable: true,
  })
  address: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Club website URL',
    example: 'https://www.fcbarcelona.com',
    nullable: true,
  })
  website: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Tickets URL',
    example: 'https://tickets.fcbarcelona.com',
    nullable: true,
  })
  ticketsUrl: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Twitter account handle',
    example: '@FCBbasket',
    nullable: true,
  })
  twitterAccount: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Instagram account handle',
    example: '@fcbbasket',
    nullable: true,
  })
  instagramAccount: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Facebook account handle',
    example: 'fcbasket',
    nullable: true,
  })
  facebookAccount: Nullable<string>;

  @ApiProperty({
    description: 'Primary venue information',
    type: () => Venue,
  })
  venue: Venue;

  @ApiPropertyOptional({
    description: 'Backup venue name',
    example: 'Alternative Arena',
    nullable: true,
  })
  venueBackup: Nullable<string>;

  @ApiPropertyOptional({
    description: 'National competition code',
    example: 'ACB',
    nullable: true,
  })
  nationalCompetitionCode: Nullable<string>;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Barcelona',
    nullable: true,
  })
  city: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Club president name',
    example: 'Joan Laporta',
    nullable: true,
  })
  president: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+34 902 189 900',
    nullable: true,
  })
  phone: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Contact fax number',
    example: '+34 93 411 22 19',
    nullable: true,
  })
  fax: Nullable<string>;

  @ApiProperty({
    description: 'Club images by size/type',
    example: { logo: 'https://...', banner: 'https://...' },
    nullable: true,
  })
  images: Nullable<{ [key: string]: string }>;
}
