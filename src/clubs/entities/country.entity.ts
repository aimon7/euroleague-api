import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';

export class Country {
  @ApiProperty({
    description: 'Country code',
    example: 'ESP',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Country name',
    example: 'Spain',
    nullable: true,
  })
  name: Nullable<string>;
}
