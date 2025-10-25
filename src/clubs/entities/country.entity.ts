import { ApiProperty } from '@nestjs/swagger';

export class Country {
  @ApiProperty({
    description: 'Country code',
    example: 'ESP',
  })
  code: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Spain',
  })
  name: string;
}
