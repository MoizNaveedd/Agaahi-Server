import { IsEnum, IsInt, IsNotEmpty, IsString, Min, Max, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationParam } from 'src/shared/dto/Pagination.dto';

export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
}

export class DatabaseConnectionDto {
  @ApiProperty({ enum: DatabaseType, description: 'Database type must be either "postgres" or "mysql"' })
  @IsEnum(DatabaseType, { message: 'Database type must be either "postgres" or "mysql"' })
  type: DatabaseType;

  @ApiProperty({ description: 'The host of the database' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ description: 'The port of the database', minimum: 1, maximum: 65535 })
  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ description: 'The user for the database connection' })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty({ description: 'The password for the database connection' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'The name of the database' })
  @IsString()
  @IsNotEmpty()
  database: string;

  @ApiProperty({ description: 'company Id ' })
  @IsNumber()
  @IsNotEmpty()
  company_id: number;
}

export class EditorQueryDto {
  @ApiProperty({ description: 'The prompt for the query to be executed' })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class GetHistoryDto extends PaginationParam {}

export class EditorDataDto {
  @ApiProperty({ description: 'The query to be executed' })
  @IsString()
  @IsNotEmpty()
  query: string;

  // @ApiProperty({ description: 'The table name to be executed' })
  // @IsString()
  // @IsNotEmpty()
  // table: string;
}
