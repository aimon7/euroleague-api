import { ApiProperty } from '@nestjs/swagger';

// Since TypeScript does not store metadata about generics or interfaces,
//  when you use them in your DTOs, SwaggerModule may not be able to properly generate model definitions at runtime.
//   So we moved the generic type out of the PaginatedResponseDto class.
//    See also: https://docs.nestjs.com/openapi/types-and-parameters#generics-and-interfaces
export class PaginatedResponseDto {
  @ApiProperty({
    description: 'Total number of items available',
    example: 100,
  })
  total: number;
}
