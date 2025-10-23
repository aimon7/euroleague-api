import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { Club } from '../entities/club.entity';

export class PaginatedClubResponseDto extends PaginatedResponseDto<Club> {}
