import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';
import { Country } from '../../countries/entities/country.entity';
import { Venue } from '../../venues/entities/venue.entity';

export class Club {
  @ApiProperty({
    description: 'Club code',
    example: 'OLY',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Club name',
    example: 'Olympiacos Piraeus',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiProperty({
    description: 'Club alias',
    example: 'Olympiacos',
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
    example:
      'Ethnarchou Makariou 1  Av., 18547  Neo Faliro /  Piraeus - Greece',
    nullable: true,
  })
  address: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Club website URL',
    example: 'http://www.olympiacosbc.gr',
    nullable: true,
  })
  website: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Tickets URL',
    example: 'https://www.olympiacosbc.gr/el/tickets-el.html',
    nullable: true,
  })
  ticketsUrl: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Twitter account handle',
    example: 'Olympiacos_BC',
    nullable: true,
  })
  twitterAccount: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Instagram account handle',
    example: 'olympiacosbc/',
    nullable: true,
  })
  instagramAccount: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Facebook account handle',
    example: 'olympiacosbc',
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
    example: 'GBL',
    nullable: true,
  })
  nationalCompetitionCode: Nullable<string>;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'PIRAIEUS',
    nullable: true,
  })
  city: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Club president name',
    example: 'Panagiotis and Georgios Angelopoulos',
    nullable: true,
  })
  president: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+30 210 452 7600',
    nullable: true,
  })
  phone: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Contact fax number',
    example: '+30 210 452 7600',
    nullable: true,
  })
  fax: Nullable<string>;

  @ApiProperty({
    description: 'Club images by size/type',
    example: {
      crest:
        'https://media-cdn.incrowdsports.com/789423ac-3cdf-4b89-b11c-b458aa5f59a6.png',
      logo: 'https://...',
      banner: 'https://...',
    },
    nullable: true,
  })
  images: Nullable<{ [key: string]: string }>;
}
