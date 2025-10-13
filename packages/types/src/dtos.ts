// Shared DTOs (Data Transfer Objects)

export interface PaginationDto {
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

