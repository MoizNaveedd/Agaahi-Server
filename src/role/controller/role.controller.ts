// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Put,
//   Query,
// } from '@nestjs/common';
// import { RoleService } from '../role.service';
// import { ApiTags } from '@nestjs/swagger';
// // import { Authorized } from 'src/shared/decorators/authorized.decorator';
// import { AddRoleDto, GetRoleDto, UpdateRoleDto } from '../dto/role.dto';
// import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
// import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
// import { RolePermissions } from 'src/shared/enums/permission.enum';

// @ApiTags('Role')
// @Controller('role')
// export class RoleController {
//   constructor(private readonly roleService: RoleService) {}

//   @Authorized(RolePermissions.AddRole)
//   @Post()
//   async AddRole(
//     @Body() data: AddRoleDto,
//     @CurrentUser() user: IRedisUserModel,
//   ) {
//     const role = await this.roleService.AddRole(data, user);
//     return role;
//   }

//   @Authorized(RolePermissions.ViewRoles)
//   @Get()
//   async GetCompanyRole(
//     @CurrentUser() user: IRedisUserModel,
//     @Query() params: GetRoleDto,
//   ) {
//     const roles = await this.roleService.GetCompanyRole(user, params);
//     return roles;
//   }

//   @Authorized(RolePermissions.UpdateRole)
//   @Put('/:roleId([0-9]+)')
//   async UpdateRole(
//     @Param('roleId') roleId: number,
//     @Body() data: UpdateRoleDto,
//     @CurrentUser() user: IRedisUserModel,
//   ) {
//     const role = await this.roleService.UpdateRole(roleId, data, user);
//     return role;
//   }

//   @Authorized(RolePermissions.DeleteRole)
//   @Delete('/:roleId([0-9]+)')
//   async DeleteRole(
//     @Param('roleId') roleId: number,
//     @CurrentUser() user: IRedisUserModel,
//   ) {
//     const role = await this.roleService.DeleteRole(roleId, user);
//     return role;
//   }

//   @Authorized(RolePermissions.ViewRoles)
//   @Get('/:roleId([0-9]+)')
//   async GetRoleById(
//     @Param('roleId') roleId: number,
//     @CurrentUser() user: IRedisUserModel,
//   ) {
//     const role = await this.roleService.GetRoleById(roleId, user);
//     return role;
//   }
// }
