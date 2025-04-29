import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmployeeService } from '../../employee.service';
// import { Authorized } from 'src/shared/decorators/authorized.decorator';
// import { RolePermissions } from 'src/shared/enums/permission.enum';

// import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
// import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
// import {
//   AddEmployeeDto,
//   ChangePasswordDto,
//   ForgotPasswordDto,
//   GetEmployeeDto,
//   LoginDto,
//   PinCheckerDto,
//   ResetPasswordDto,
//   UpdateEmployeeDto,
//   UpdateEmployeeLanguageDto,
//   UpdateMeDtoIMS,
//   ValidateEmailDto,
// } from '../dto/employee.dto';
import { AuthService } from '../../auth.service';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import {
  AddEmployeeDto,
  ChangePasswordDto,
  GetEmployeeDto,
  LoginDto,
  UpdateEmployeeDto,
  UpdateEmployeeLanguageDto,
} from '../dto/employee.dto';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { PortalType } from 'src/shared/enums/portal.enum';
// import { PortalType } from 'src/shared/enums/portal.enum';
// // import { multerObj } from 'src/shared/helpers/MediaHelper';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { S3Prefix } from 'src/shared/enums/s3-prefix.enum';

@ApiTags('Employee - IMS')
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
  ) {}

  //   @Post('/validate-email')
  //   async ValidateEmail(@Body() data: ValidateEmailDto) {
  //     const employee = await this.authService.ValidateEmail(data);
  //     return employee;
  //   }

  @Post('/login')
  async login(@Body() data: LoginDto) {
    const userInfo = await this.authService.LoginIMS(data);
    return userInfo;
  }

  @Authorized()
  @Post('add-employee')
  async AddEmployee(
    @Body() data: AddEmployeeDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const employee = await this.employeeService.AddEmployee(data, user);
    return employee;
  }

  @Authorized()
  @Get()
  async GetEmployee(
    @Query() params: GetEmployeeDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const employee = await this.employeeService.GetAllEmployees(params, user);
    return employee;
  }

  //   @Authorized(RolePermissions.DeleteEmployee)
  //   @Delete('/:employeeId([0-9]+)')
  //   async DeleteEmployee(
  //     @Param('employeeId') employeeId: number,
  //     @CurrentUser() user: IRedisUserModel,
  //   ) {
  //     const employee = await this.employeeService.DeleteEmployee(
  //       employeeId,
  //       user,
  //     );
  //     return employee;
  //   }

  @Authorized()
  @Put('/reset-password')
  async ChangePassword(
    @Body() data: ChangePasswordDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    await this.employeeService.ChangePassword(data, user);
    return {};
  }

  @Authorized()
  @Put('/:employeeId')
  async UpdateEmployee(
    @Param('employeeId') employeeId: number,
    @Body() data: UpdateEmployeeDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const employee = await this.employeeService.UpdateEmployee(
      employeeId,
      data,
      user,
    );
    return employee;
  }

  @Authorized()
  @Get('/me')
  async Me(@CurrentUser({ required: true }) user: IRedisUserModel) {
    const employee = await this.employeeService.Me(user.employee_id);
    return employee;
  }

  @Authorized()
  @Get('/logout')
  async Logout(@CurrentUser() user: IRedisUserModel) {
    await this.authService.Logout(user, PortalType.IMS);
    return null;
  }

  @Authorized()
  @Get('/:employeeId')
  async GetEmployeeById(
    @Param('employeeId') employeeId: number,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const employee = await this.employeeService.GetEmployeeById(
      employeeId,
      user,
    );
    return employee;
  }

  @Authorized()
  @Put('/language')
  async UpdateEmployeeLanguage(
    @Body() data: UpdateEmployeeLanguageDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const employee = await this.employeeService.UpdateEmployeeLanguage(
      data,
      user,
    );
    return employee;
  }

  //   @Post('/forgot-password')
  //   async ForgotPassword(@Body() data: ForgotPasswordDto) {
  //     return await this.authService.ForgotPassword(data);
  //   }

  //   @Post('/reset-password/:token')
  //   async ResetPassword(
  //     @Body() data: ResetPasswordDto,
  //     @Param('token') token: string,
  //   ) {
  //     return await this.authService.ResetPassword(data, token);
  //   }

  //   @Authorized(RolePermissions.UpdateEmployee)
  //   @Put('/mfa/revoke/:employeeId([0-9]+)')
  //   async MfaRevoke(
  //     @Param('employeeId') employeeId: number,
  //     @CurrentUser() user: IRedisUserModel,
  //   ) {
  //     return await this.authService.MfaRevoke(employeeId, user);
  //   }

  //   @Authorized()
  //   @Get('/name')
  //   async GetEmployeeName(
  //     @Query() params: GetEmployeeDto,
  //     @CurrentUser() user: IRedisUserModel,
  //   ) {
  //     return await this.employeeService.GetEmployeeName(user, params);
  //   }
}
