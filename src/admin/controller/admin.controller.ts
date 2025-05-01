import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from 'src/admin/admin.service';
import { AuthorizedAdmin } from 'src/shared/decorators/authorized.decorator';
import { CurrentAdmin } from 'src/shared/decorators/current-user.decorator';
import { AdminRole } from 'src/shared/enums/admin-role.enum';
import { IRedisAdminModel } from 'src/shared/interfaces/IRedisAdminModel';
import { AddAdminDto, AdminLoginDto, GetAdminsDto, UpdateAdminDto, UpdateMeDto } from '../dto/admin.dto';

@ApiTags("Admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("/login")
  async LogIn(
    @Body() data: AdminLoginDto,
  ) {
    const admin = await this.adminService.LoginAdmin(data);
    return admin;
  }

  @AuthorizedAdmin()
  @Get("/logout")
  async Logout(
    @CurrentAdmin() admin: IRedisAdminModel,
  ) {
    await this.adminService.LogOutAdmin(admin);
    return null;
  }

  @AuthorizedAdmin()
  @Get("me")
  async Me(@CurrentAdmin() admin: IRedisAdminModel) {
    const adminModel = await this.adminService.GetAdminById(admin.id);
    return adminModel;
  }

  @AuthorizedAdmin(AdminRole.SuperAdmin)
  @Post("/admin")
  async AddAdmin(
    @Body() data: AddAdminDto,
    @CurrentAdmin() admin: IRedisAdminModel,
  ) {
    const adminModel = await this.adminService.AddAdmin(data, admin);
    return adminModel;
  }

  // @AuthorizedAdmin(AdminRole.SuperAdmin)
  // @Put("mfa/revoke/:adminId)")
  // async MfaRevoke(@Param("adminId") adminId: number) {
  //   await this.adminService.MfaRevoke(adminId);
  //   return null;
  // }

  @AuthorizedAdmin(AdminRole.SuperAdmin)
  @Get("/admin")
  async GetAdmins(@Query() filters: GetAdminsDto) {
    const adminUsers = await this.adminService.GetAdmins(filters);
    return adminUsers;
  }

  @AuthorizedAdmin(AdminRole.SuperAdmin)
  @Get("/:adminId")
  async GetAdminById(@Param("adminId") adminId: number) {
    const admin = await this.adminService.GetAdminById(adminId);
    return admin;
  }

  @AuthorizedAdmin(AdminRole.SuperAdmin)
  @Put("/:adminId/update")
  async UpdateAdminById(
    @Param("adminId") adminId: number,
    @Body() data: UpdateAdminDto,
  ) {
    const admin = await this.adminService.UpdateAdmin(adminId, data);
    return admin;
  }

  @AuthorizedAdmin(AdminRole.SuperAdmin)
  @Delete("/:adminId")
  async DeleteAdminById(@Param("adminId") adminId: number) {
    await this.adminService.DeleteAdminById(adminId);
    return {};
  }

  @AuthorizedAdmin()
  @Put("me")
  async UpdateMe(
    @Body() data: UpdateMeDto,
    @CurrentAdmin()
    admin: IRedisAdminModel,
  ) {
    const adminInfo = await this.adminService.UpdateMe(admin.id, data);
    return adminInfo;
  }
}