import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
