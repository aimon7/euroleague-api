import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { Club } from '../entities/club.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedClubResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    description: 'List of clubs',
    type: [Club],
  })
  data: Club[];
}
