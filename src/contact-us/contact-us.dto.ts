import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class ContactUsDto {
  @ApiProperty({ description: 'The first name of the person contacting' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'The last name of the person contacting' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'The email address of the person contacting' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The phone number of the person contacting', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'The message from the person contacting' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'The ID of the company', required: false })
  @IsString()
  @IsOptional()
  company_id?: string;
}