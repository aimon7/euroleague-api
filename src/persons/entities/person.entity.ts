import { ApiProperty } from '@nestjs/swagger';
import { Country } from 'src/countries/entities/country.entity';
import type { Nullable } from 'src/shared/types/nullable';

export class Person {
  @ApiProperty({
    description: 'Person code',
    example: '001869',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Person full name',
    example: 'BARTZOKAS, GEORGIOS',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiProperty({
    description: 'Person alias',
    example: 'BARTZOKAS, GEORGIOS',
    nullable: true,
  })
  alias: Nullable<string>;

  @ApiProperty({
    description: 'Person raw alias',
    example: 'BARTZOKAS, GEORGIOS',
    nullable: true,
  })
  aliasRaw: Nullable<string>;

  @ApiProperty({
    description: 'Passport first name',
    example: 'GEORGIOS',
    nullable: true,
  })
  passportName: Nullable<string>;

  @ApiProperty({
    description: 'Passport surname',
    example: 'BARTZOKAS',
    nullable: true,
  })
  passportSurname: Nullable<string>;

  @ApiProperty({
    description: 'Jersey name',
    example: '',
    nullable: true,
  })
  jerseyName: Nullable<string>;

  @ApiProperty({
    description: 'Abbreviated name',
    example: 'Bartzokas, G.',
    nullable: true,
  })
  abbreviatedName: Nullable<string>;

  @ApiProperty({
    description: 'Person country',
    type: () => Country,
    nullable: true,
  })
  country: Nullable<Country>;

  @ApiProperty({
    description: 'Person height in cm',
    example: 0,
    nullable: true,
  })
  height: Nullable<number>;

  @ApiProperty({
    description: 'Person weight in kg',
    example: 0,
    nullable: true,
  })
  weight: Nullable<number>;

  @ApiProperty({
    description: 'Birth date',
    example: '1965-06-11T00:00:00',
    nullable: true,
  })
  birthDate: Nullable<string>;

  @ApiProperty({
    description: 'Birth country',
    type: () => Country,
    nullable: true,
  })
  birthCountry: Nullable<Country>;

  @ApiProperty({
    description: 'Twitter account handle',
    example: '',
    nullable: true,
  })
  twitterAccount: Nullable<string>;

  @ApiProperty({
    description: 'Instagram account handle',
    example: '',
    nullable: true,
  })
  instagramAccount: Nullable<string>;

  @ApiProperty({
    description: 'Facebook account handle',
    example: '',
    nullable: true,
  })
  facebookAccount: Nullable<string>;

  @ApiProperty({
    description: 'Whether the person is a referee',
    example: false,
  })
  isReferee: boolean;

  @ApiProperty({
    description: 'Person images by size/type',
    example: {},
    nullable: true,
  })
  images: Nullable<{ [key: string]: string }>;
}
