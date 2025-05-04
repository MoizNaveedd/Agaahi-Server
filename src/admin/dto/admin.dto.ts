import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from "class-validator";
import { ToBoolean } from "src/shared/decorators/boolean.decorator";
import { PaginationParam } from "src/shared/dto/Pagination.dto";
import { AdminRole } from "src/shared/enums/admin-role.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ValidateAccountDto {
  @ApiProperty({
    description: 'Email address of admin',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Password (8-16 characters, must include at least one number)',
    example: 'password1',
  })
  @IsNotEmpty()
  @Matches(/^(?=.*\d).{8,16}$/i, {
    message:
      "Password must be at least 8 characters long and contain one number.",
  })
  password: string;
}

export class AdminLoginDto extends ValidateAccountDto {
  @ApiProperty({
    description: '6-digit MFA code',
    example: '123456',
  })
  // @IsNotEmpty()
  // @Length(6, 6)
  // mfa_code: string;
}

export class GetAdminsDto extends PaginationParam {
  @ApiPropertyOptional({
    description: 'Filter by active status (true/false)',
    example: true,
  })
  @IsOptional()
  @ToBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by admin name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class AddAdminDto extends ValidateAccountDto {
  @ApiProperty({
    description: 'Full name of the admin',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Country calling code (e.g., +966)',
    example: '+966',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 5)
  @Matches(/^\+\d{1,4}$/i)
  country_code: string;

  @ApiProperty({
    description: 'Phone number (5 to 20 digits)',
    example: '501234567',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @ApiProperty({
    description: 'Whether the admin is active',
    example: true,
  })
  @IsNotEmpty()
  @ToBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    enum: AdminRole,
    description: 'Admin role (optional)',
    example: AdminRole.SuperAdmin,
  })
  @IsOptional()
  @IsNumber()
  @IsEnum(AdminRole)
  role: AdminRole;
}

export class MfaRevokeDto {
  @ApiProperty({
    description: 'List of admin IDs to revoke MFA from',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  admin_ids: number[];
}

export class UpdateAdminDto {
  @ApiPropertyOptional({
    description: 'Updated full name',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  full_name: string;

  @ApiPropertyOptional({
    description: 'Updated country code',
    example: '+971',
  })
  @IsOptional()
  @IsString()
  country_code: string;

  @ApiPropertyOptional({
    description: 'Updated phone number (5 to 20 digits)',
    example: '507654321',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Updated active status (true/false)',
    example: false,
  })
  @IsOptional()
  @ToBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    enum: AdminRole,
    description: 'Updated admin role',
    example: AdminRole.Admin,
  })
  @IsOptional()
  @IsNumber()
  @IsEnum(AdminRole)
  role: AdminRole;
}

export class UpdateMeDto {
  @ApiPropertyOptional({
    description: 'Updated full name',
    example: 'Ahmed Ali',
  })
  @IsOptional()
  @IsString()
  full_name: string;

  @ApiPropertyOptional({
    description: 'Updated country code',
    example: '+965',
  })
  @IsOptional()
  @IsString()
  country_code: string;

  @ApiPropertyOptional({
    description: 'Updated phone number (5 to 20 digits)',
    example: '599988877',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Current password (required if setting new password)',
    example: 'oldpass1',
  })
  @IsOptional()
  @ValidateIf((data) => data.password)
  @Matches(/^(?=.*\d).{8,16}$/i, {
    message:
      "Password must be at least 8 characters long and contain one number.",
  })
  previous_password: string;

  @ApiPropertyOptional({
    description: 'New password (8-16 characters, must include one number)',
    example: 'newpass2',
  })
  @IsOptional()
  @ValidateIf((data) => data.previous_password)
  @Matches(/^(?=.*\d).{8,16}$/i, {
    message:
      "Password must be at least 8 characters long and contain one number.",
  })
  password: string;
}
