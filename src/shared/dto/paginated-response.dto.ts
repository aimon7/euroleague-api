export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
}
