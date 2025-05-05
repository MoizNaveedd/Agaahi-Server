import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";
import { GetEmployeeDto } from "src/employee/ims/dto/employee.dto";
import { ToBoolean } from "src/shared/decorators/boolean.decorator";
import { appEnv } from "src/shared/helpers/EnvHelper";

export class GetEmployeeAdminDto extends GetEmployeeDto {
  @ApiProperty({ description: 'company Id', example: 2 })
  @IsOptional()
  @IsNumber()
  company_id?: number;
}

export class UpdateEmployeeByAdminDto {
  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @ToBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, appEnv('PIN_LENGTH',4))
  pin: string;
}