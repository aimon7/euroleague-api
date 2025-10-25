import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Nullable } from 'src/shared/types/nullable';

export class Venue {
  @ApiPropertyOptional({
    description: 'Venue name',
    example: 'PEACE AND FRIENDSHIP STADIUM',
    nullable: true,
  })
  name: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Venue code',
    example: 'ASF6',
    nullable: true,
  })
  code: Nullable<string>;

  @ApiPropertyOptional({
    description: 'Venue capacity',
    example: 12700,
    nullable: true,
  })
  capacity: Nullable<number>;

  @ApiPropertyOptional({
    description: 'Venue address',
    example: 'Ethnarchou Makariou Av., Piraeus',
    nullable: true,
  })
  address: Nullable<string>;

  @ApiProperty({
    description: 'Venue images by size/type',
    example: { large: 'https://...', medium: 'https://...' },
    nullable: true,
  })
  images: Nullable<{ [key: string]: string }>;

  @ApiProperty({
    description: 'Whether the venue is active',
    example: true,
  })
  active: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes about the venue',
    nullable: true,
  })
  notes: Nullable<string>;
}
