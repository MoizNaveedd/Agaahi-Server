import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'src/shared/decorators/boolean.decorator';
import { PaginationParam } from 'src/shared/dto/Pagination.dto';

export class AddRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @ToBoolean()
  status: boolean;

  @IsOptional()
  @IsArray()
  page_permission: string[];

  @IsOptional()
  @IsArray()
  action_permission: string[];
}

export class GetRoleDto extends PaginationParam {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ToBoolean()
  status?: boolean;
}

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ToBoolean()
  status?: boolean;

  @IsOptional()
  @IsArray()
  page_permission?: string[];

  @IsOptional()
  @IsArray()
  action_permission?: string[];
}
