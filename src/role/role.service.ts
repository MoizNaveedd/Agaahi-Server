import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { RoleRepository } from './repository/role.repository';
import { RoleModel } from './entity/role.entity';
import { CompanyRoleRepository } from './repository/company-role.repository';
// import { CompanyRoleModel } from './entity/company-role.entity';
import { AddRoleDto, SetCompanyRoleDto, UpdateRoleDto } from './dto/role.dto';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { GetPaginationOptions } from 'src/shared/helpers/UtilHelper';
// import { PermissionService } from 'src/permission/permission.service';
import Role from 'src/shared/enums/role-ims.enum';
import { ErrorMessageConstant } from 'src/shared/constants/ErrorMessageConstant';
import { EmployeeRepository } from 'src/employee/repository/employee.repository';
import { CompanyRoleModel } from './entity/company-role.entity';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly companyRoleRepository: CompanyRoleRepository,
    // private readonly permissionService: PermissionService,
    @Inject(forwardRef(() => EmployeeRepository))
    private employeeRepository: EmployeeRepository,
  ) {}


  public async GetCompanyRole(user: IRedisUserModel, params) {
    return await this.roleRepository.Find(
      { is_deleted: 0 },)
  }

  public async GetRoleById(roleId: number, user?: IRedisUserModel) {
    return await this.roleRepository.FindOne(
      { id: roleId, is_deleted: 0 },{ relations: ['company_role'] }
    );
  }

  public async GetCompanyRoleDetails(roleId: number, company_id: number){
    return await this.companyRoleRepository.FindOne({
      company_id: company_id,
      role_id: roleId,
      is_deleted: 0,
    },{ relations: ['role'] });
  }

  public async AddCompanyRole(data: SetCompanyRoleDto, user: IRedisUserModel){
    const role = await this.roleRepository.FindOne(
      { id: data.role_id, is_deleted: 0 },
    );

    if(!role){
      throw new BadRequestException(
        ErrorMessageConstant['en'].RoleNotExists,
      );
    }

    const companyRoleExist = await this.companyRoleRepository.FindOne(
      { company_id: user.company_id, role_id: data.role_id },
    );

    let companyRole = companyRoleExist ?? new CompanyRoleModel();
    companyRole.company_id = user.company_id;
    companyRole.role_id = data.role_id;
    companyRole.table_permission = data.table_permission;

    await this.companyRoleRepository.Save(companyRole);
    return companyRole;
  }

  // public async AddRole(data: AddRoleDto, user: IRedisUserModel) {
  //   const roleExist = await 
  //     this.CheckRoleExist(user.company_id, data.name)

  //   if (roleExist) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[user.language].RoleAlreadyExists,
  //     );
  //   }

  //   const role = await this.CreateRole(data);

  //   // await this.permissionService.CreatePermissions(
  //   //   role.id,
  //   //   data.page_permission,
  //   //   data.action_permission,
  //   // );

  //   // const companyRole = await this.AddCompanyRole(user.company_id, role.id);

  //   return { role, companyRole };
  // }

  // public async GetInfoFromCompanyRole(company_role_id: number) {
  //   const companyRole = await this.companyRoleRepository.FindOne(
  //     { id: company_role_id },
  //     { relations: ['role', 'company'] },
  //   );

  //   return companyRole;
  // }

  // public async UpdateRole(
  //   roleId: number,
  //   data: UpdateRoleDto,
  //   user: IRedisUserModel,
  // ) {
  //   const { role } = await this.companyRoleRepository.FindOne(
  //       { id: roleId, is_deleted: 0 },
  //       { relations: ['role'] },
  //     );

  //     if (!role) {
  //     throw new BadRequestException(
  //       ErrorMessageConstant[user.language].RoleNotExists,
  //     );
  //   }

  //   // if (role.id == Role.Owner || role.id == Role.Admin) {
  //   //   throw new BadRequestException(
  //   //     ErrorMessageConstant[user.language].NotAllowedToChangeOwner,
  //   //   );
  //   // }

  //   role.name = data?.name ?? role.name;
  //   role.description = data?.description ?? role.description;
  //   role.status = data.status != undefined ? data?.status : role.status;
  //   role.updated_by = user.employee_id;

  //   // if (data.page_permission || data.action_permission) {
  //   //   await this.permissionService.UpdatePermissions(
  //   //     role.id,
  //   //     data.page_permission,
  //   //     data.action_permission,
  //   //   );
  //   // }

  //   await this.roleRepository.Update({ id: role.id }, role);
  //   return true;
  // }

  // private async CreateRole(data: AddRoleDto): Promise<RoleModel> {
  //   const role = new RoleModel();
  //   role.name = data.name;
  //   role.description = data.description ?? null;
  //   role.status = data?.status != undefined ? data.status : true;

  //   return await this.roleRepository.Save(role);
  // }

  // public async GetCompanyRole(user: IRedisUserModel, params) {
  //   const roles = await this.companyRoleRepository.GetCompanyRoles(
  //     user,
  //     params,
  //     GetPaginationOptions(params),
  //   );

  //   return roles;
  // }

  // // public async DeleteRole(roleId: number, user: IRedisUserModel) {
  // //   const companyRole = await this.companyRoleRepository.FindOne(
  // //       { id: roleId },
  // //       { relations: ['role'] },
  // //     )

  // //   if (
  // //     companyRole.role_id == Role.Owner ||
  // //     companyRole.role_id == Role.Admin
  // //   ) {
  // //     throw new BadRequestException(
  // //       ErrorMessageConstant[
  // //         user.language
  // //       ].NotAllowedToDeleteAdminOrOwnerRole,
  // //     );
  // //   }

  // //   return await this.companyRoleRepository.DeleteById(roleId, true);
  // // }

  // // public async AddCompanyRole(
  // //   company_id: number,
  // //   role_id: number,
  // // ): Promise<CompanyRoleModel> {
  // //   const companyRole = new CompanyRoleModel();
  // //   companyRole.company_id = company_id;
  // //   companyRole.role_id = role_id;

  // //   return await this.companyRoleRepository.Save(companyRole);
  // // }

  // public async CheckRoleExist(company_id: number, role_name: string) {
  //   const role = await this.companyRoleRepository.FindOne(
  //     {
  //       company_id: company_id,
  //       role: { name: role_name },
  //     },
  //     {
  //       relations: ['role'],
  //     },
  //   );
  //   return role;
  // }

  // public async GetRoleById(companyRoleId: number, user: IRedisUserModel) {
  //   const role = await this.companyRoleRepository.FindOne(
  //     {
  //       id: companyRoleId,
  //       company_id: user.company_id,
  //       is_deleted: 0,
  //     },
  //     { relations: ['role', 'role.action_permission', 'role.page_permission'] },
  //   );
  //   return role;
  // }
}
