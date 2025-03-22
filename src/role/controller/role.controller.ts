import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from '../role.service';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { GetRoleDto, SetCompanyRoleDto } from '../dto/role.dto';
// import { ApiTags } from '@nestjs/swagger';
// // import { Authorized } from 'src/shared/decorators/authorized.decorator';
// import { AddRoleDto, GetRoleDto, UpdateRoleDto } from '../dto/role.dto';
// import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
// import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
// import { RolePermissions } from 'src/shared/enums/permission.enum';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Authorized()
  @Get()
  async GetCompanyRole(
    @CurrentUser() user: IRedisUserModel,
    @Query() params: GetRoleDto,
  ) {
    const roles = await this.roleService.GetCompanyRole(user, params);
    return roles;
  }

  @Authorized()
  @Get('/:roleId')
  async GetRoleById(
    @Param('roleId') roleId: number,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const role = await this.roleService.GetRoleById(roleId, user);
    return role;
  }

  @Authorized()
  @Post()
  @ApiOperation({ summary: 'Add a new company role' }) // Description of the endpoint
  @ApiBody({
    description: 'Details of the company role to be added',
    type: SetCompanyRoleDto, // Reference to the DTO
  })
  async AddCompanyRoleDetails(
    @Body() data: SetCompanyRoleDto,
    @CurrentUser() user: IRedisUserModel,
  ) {
    const role = await this.roleService.AddCompanyRole(data, user);
    return role;
  }
}
