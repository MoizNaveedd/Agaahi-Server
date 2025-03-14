import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ToBoolean } from 'src/shared/decorators/boolean.decorator';
import { PaginationParam } from 'src/shared/dto/Pagination.dto';
import { Gender } from 'src/shared/enums/gender.enum';
import { Language } from 'src/shared/enums/language.enum';
import { appEnv } from 'src/shared/helpers/EnvHelper';

export class LanguageDto {
  @IsOptional()
  @IsEnum(Language)
  user_language: Language;
}

export class ValidateEmailDto extends LanguageDto {
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*\d).{8,50}$/i, {
    message:
      'Password must be at least 8 characters long and contain one number.',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}


export class LoginDto extends ValidateEmailDto {
  @IsNotEmpty()
  @Length(6, 6)
  mfa_code: string;
}

export class AddEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ValidateIf((data) => data.phone_number)
  @IsNotEmpty()
  @Length(2, 5)
  @Matches(/^(\+)?\d{1,4}$/i)
  country_code: string;

  @ValidateIf((data) => data.country_code)
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number: string;

  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @IsOptional()
  @ToBoolean()
  status: boolean;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*\d).{8,50}$/i, {
    message:
      'Password must be at least 8 characters long and contain one number.',
  })
  password: string;

  // @IsOptional()
  // @IsArray()
  // store_ids: number[];

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;
}

export class GetEmployeeDto extends PaginationParam {
  @IsOptional()
  @IsNumber()
  role_id?: number;

  @IsOptional()
  @ToBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  store_id?: number;
}

export class UpdateMeDtoIMS {
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateEmployeeDto extends UpdateMeDtoIMS {
  @IsOptional()
  @IsNumber()
  role_id?: number;

  @IsOptional()
  @ToBoolean()
  status?: boolean;

  @IsOptional()
  @Length(2, 5)
  @Matches(/^(\+)?\d{1,4}$/i)
  country_code?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5,20}$/i)
  phone_number?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*\d).{8,50}$/i, {
    message:
      'Password must be at least 8 characters long and contain one number.',
  })
  password?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

export class PinCheckerDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, appEnv('PIN_LENGTH',4))
  pin: string;
}

export class UpdateEmployeeLanguageDto {
  @IsNotEmpty()
  @IsEnum(Language)
  user_language: Language;
}

export class ForgotPasswordDto extends LanguageDto{
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

export class ResetPasswordDto extends LanguageDto{
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*\d).{8,50}$/i, {
    message:
      'Password must be at least 8 characters long and contain one number.',
  })
  password: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*\d).{8,50}$/i, {
    message:
      "New Password must be at least 8 characters long and contain one number.",
  })
  new_password: string;
}

