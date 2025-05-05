import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateDashboardChartDto {
  @ApiProperty({ description: 'Chart ID', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  chart_id: number;

  @ApiProperty({
    description: 'User input prompt',
    example: 'Show trend of orders with order date',
  })
  @IsNotEmpty()
  @IsString()
  user_prompt: string;
}


export class ChartDto {
  @ApiProperty({ description: 'x-Axis' })
  @IsString()
  x_axis: string;

  @ApiProperty({ description: 'y-Axis' })
  @IsString()
  y_axis: string;

  @ApiProperty({ description: 'SQL query' })
  @IsString()
  sql_query: string;

  @ApiProperty({ description: 'meta info' })
  @IsString()
  meta_info: string;

  @ApiProperty({ description: 'chart ID' })
  @IsInt()
  chart_id: number;
}

export class LayoutDto {
  @ApiProperty({ description: 'Breakpoint for the layout (e.g., lg, md, sm)', example: 'lg', required: false })
  @IsOptional()
  @IsString()
  breakpoint?: string;

  @ApiProperty({ description: 'Width of the layout item', example: 4 })
  @IsNotEmpty()
  @IsNumber()
  width: number;

  @ApiProperty({ description: 'Height of the layout item', example: 3 })
  @IsNotEmpty()
  @IsNumber()
  height: number;

  @ApiProperty({ description: 'X-axis position of the layout item', example: 0 })
  @IsNotEmpty()
  @IsNumber()
  position_x: number;

  @ApiProperty({ description: 'Y-axis position of the layout item', example: 0 })
  @IsNotEmpty()
  @IsNumber()
  position_y: number;

  @ApiProperty({ description: 'Whether the layout item is static or not', example: false })
  @IsNotEmpty()
  @IsBoolean()
  is_static: boolean;

  @ApiProperty({ description: 'Grid ID of the layout item', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  grid_i: number;

  @ApiProperty({ type: ChartDto })
  @ValidateNested()
  @Type(() => ChartDto)
  chart: ChartDto;
}

export class LayoutArrayDto {
  @ApiProperty({
    description: 'Array of layout objects',
    type: LayoutDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => LayoutDto)
  layouts: LayoutDto[];
}
export class ChartSaveDto {
  @ApiProperty({ description: 'Chart ID', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  chart_id: number;

  @ApiProperty({ description: 'SQL query', example: 'SELECT * FROM orders' })
  @IsNotEmpty()
  @IsString()
  sql_query: string;

  @ApiProperty({ description: 'chart name', example: 'Total Delivered Orders' })
  @IsString()
  chart_name: string;

  @ApiProperty({ description: 'X axis', example: 'date' })
  @IsNotEmpty()
  @IsString()
  x_axis: string;

  @ApiProperty({ description: 'Y axis', example: '["total_orders"]' })
  @IsArray()
  @IsNotEmpty()
  y_axis: string[];

  @ApiProperty({
    description: 'Meta information',
    example: 'any relevant information ',
  })
  @IsNotEmpty()
  @IsString()
  meta_info: string;
}

export interface ChartAnalysisResponse {
  chart_applicable: boolean;
  sql_query: string;
  column_mapping: {
    x_axis: string | null;
    y_axis: string[];
    series: string[];
  };
  chart_title: string;
  description: string;
}
