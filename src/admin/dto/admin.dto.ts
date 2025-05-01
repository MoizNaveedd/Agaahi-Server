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

export class ValidateAccountDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*\d).{8,16}$/i, {
    message:
      "Password must be at least 8 characters long and contain one number.",
  })
  password: string;

}
export class AdminLoginDto extends ValidateAccountDto {
  @IsNotEmpty()
  @Length(6, 6)
  mfa_code: string; 
}

export class GetAdminsDto extends PaginationParam {
  @IsOptional()
  @ToBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  name?: string;
}

export class AddAdminDto extends ValidateAccountDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 5)
  @Matches(/^\+\d{1,4}$/i)
  country_code: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @IsNotEmpty()
  @ToBoolean()
  is_active: boolean;

  @IsOptional()
  @IsNumber()
  @IsEnum(AdminRole)
  role: AdminRole;
}

export class MfaRevokeDto {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  admin_ids: number[];
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  country_code: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @IsOptional()
  @ToBoolean()
  is_active: boolean;

  @IsOptional()
  @IsNumber()
  @IsEnum(AdminRole)
  role: AdminRole;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  country_code: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @IsOptional()
  @ValidateIf((data) => data.password)
  @Matches(/^(?=.*\d).{8,16}$/i, {
    message:
      "Password must be at least 8 characters long and contain one number.",
  })
  previous_password: string;

  @IsOptional()
  @ValidateIf((data) => data.previous_password)
  @Matches(/^(?=.*\d).{8,16}$/i, {
    message:
      "Password must be at least 8 characters long and contain one number.",
  })
  password: string;
}
