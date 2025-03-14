import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches, Length, MinLength, IsOptional, IsEmail, IsEnum, IsNumber, Max, ValidateIf } from "class-validator";
import { ToBoolean } from "src/shared/decorators/boolean.decorator";
import { PaginationParam } from "src/shared/dto/Pagination.dto";
import { Gender } from "src/shared/enums/gender.enum";
import { Language } from "src/shared/enums/language.enum";

export class RegisterCompanyDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{5,20}$/i)
    phone_number: string;
  
    @IsNotEmpty()
    @Length(2, 5)
    @Matches(/^(\+)?\d{1,4}$/i)
    country_code: string;
  
    @IsString()
    @Length(1, 255)
    @IsNotEmpty()
    first_name: string;
  
    @IsString()
    @Length(1, 255)
    @IsNotEmpty()
    last_name: string;
  
    @IsNotEmpty()
    @Length(1, 255)
    @IsString()
    business_name: string;
  
    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*\d).{8,50}$/i, {
      message:
        'Password must be at least 8 characters long and contain one number.',
    })
    password: string;
  
    @IsOptional()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;
  
    @IsOptional()
    @IsEnum(Language)
    user_language?: Language;
  
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;
  }

  
export class ValidateAccountDto {
    @ValidateIf((data) => !data.email)
    @IsString()
    @Matches(/^\d{5,20}$/i)
    phone_number?: string;
  
    @ValidateIf((data) => !data.country_code || !data.phone_number)
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsEnum(Language)
    user_language?: Language;
  
    @ValidateIf((data) => !data.email)
    @Length(2, 5)
    @Matches(/^(\+)?\d{1,4}$/i)
    country_code?: string;
  }
  
  export class VerifyVerificationCodeDto extends ValidateAccountDto {
    @Length(4)
    @IsNotEmpty()
    verification_code: string;
  }
  
  export class GetCompanyDto extends PaginationParam {
    @IsOptional()
    @IsString()
     search?: string;
     
     @IsOptional()
     @ToBoolean()
     is_active?: boolean;
   }
   
   export class UpdateCompanyAdminDto {
     @IsOptional()
     @ToBoolean()
     is_active?: boolean;
   }
  
  export class UpdateCompanySettingDto {
    @ToBoolean()
    track_shift_feature: boolean;
  
    @ToBoolean()
    low_stock_notification: boolean;
  
    @ToBoolean()
    price_inclusive_of_vat: boolean;
  
    @IsNumber()
    max_discount: number;
  
    @IsNumber()
    @Max(100)
    discount_percentage: number;
  
    @IsNumber()
    vat_percentage: number;
  
    @ToBoolean()
    is_discount_allowed: boolean;
  }
  
  export class AddPaymentMethodDto {
    @IsNotEmpty()
    @IsString()
    en_name: string;
  
    @IsNotEmpty()
    @IsString()
    ar_name: string;
  
    @IsOptional()
    @ToBoolean()
    is_active: boolean;
  
    @IsNotEmpty()
    @IsNumber()
    service_fee_percentage: number;
  
    @IsNotEmpty()
    @IsString()
    type: string;
  }
  
  export class UpdatePaymentMethodDto {
    @IsOptional()
    @IsString()
    en_name: string;
  
    @IsOptional()
    @IsString()
    ar_name: string;
  
    @IsOptional()
    @ToBoolean()
    is_active: boolean;
  
    @IsOptional()
    @IsNumber()
    service_fee_percentage: number;
  
    @IsOptional()
    @IsString()
    type: string;
  }
  
  export class UpdateCompanyDto {
    @IsOptional()
    @Length(1, 255)
    @IsString()
    business_name: string;
  }
  