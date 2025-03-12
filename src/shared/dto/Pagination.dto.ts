import { IsOptional } from 'class-validator';

export class PaginationParam {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
