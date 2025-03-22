import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationParam {

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Limit of items per page', example: 10 })
  @IsOptional()
  limit?: number;
}
