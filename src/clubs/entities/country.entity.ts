import { ApiProperty } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';

export class Country {
  @ApiProperty({
    description: 'Country code',
    example: 'GRE',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiProperty({
    description: 'Country name',
    example: 'Greece',
    nullable: true,
  })
  name: Nullable<string>;
}
