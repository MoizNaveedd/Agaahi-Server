// import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { AuthorizedAdmin } from 'src/shared/decorators/authorized.decorator';
// import { EmployeeService } from 'src/employee/employee.service';
// import {
//   GetEmployeeAdminDto,
//   UpdateEmployeeByAdminDto,
// } from '../dto/employee.dto';
// import { AuthService } from 'src/employee/auth.service';

import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EmployeeService } from "src/employee/employee.service";
import { GetEmployeeAdminDto } from "../dto/employee.dto";
import { AuthorizedAdmin } from "src/shared/decorators/authorized.decorator";

@ApiTags('employee - Admin')
@Controller('admin/employee')
export class EmployeeControllerAdmin {
  constructor(
    private readonly employeeService: EmployeeService,
    // private readonly authService: AuthService,
  ) { }

  @AuthorizedAdmin()
  @Get()
  async GetEmployees(@Query() data: GetEmployeeAdminDto) {
    return this.employeeService.GetAllEmployees(data);
  }


  @AuthorizedAdmin()
  @Get('/:employeeId')
  async GetEmployeeById(
    @Param('employeeId') employeeId: number,
  ) {
    const employee = await this.employeeService.GetEmployeeById(
      employeeId,
    );
    return employee;
  }

  //   @AuthorizedAdmin()
  //   @Get('/:employeeId([0-9]+)')
  //   async GetEmployeeById(@Param('employeeId') employeeId: number) {
  //     const employee = await this.employeeService.GetEmployeeById(employeeId);
  //     return employee;
  //   }

  //   @AuthorizedAdmin()
  //   @Put('/:employeeId([0-9]+)')
  //   async ChangePassword(
  //     @Body() data: UpdateEmployeeByAdminDto,
  //     @Param('employeeId') employeeId: number,
  //   ) {
  //     await this.employeeService.UpdateEmployeeByAdmin(employeeId, data);
  //     return {};
  //   }

  //   @AuthorizedAdmin()
  //   @Put('/mfa/revoke/:employeeId([0-9]+)')
  //   async MfaRevoke(@Param('employeeId') employeeId: number) {
  //     return await this.authService.MfaRevoke(employeeId);
  //   }
}
