import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { RoleModel } from './entity/role.entity';
import { RoleRepository } from './repository/role.repository';
import { RoleService } from './role.service';
// import { CompanyRoleRepository } from './repository/company-role.repository';
// import { CompanyRoleModel } from './entity/company-role.entity';
import { RoleController } from './controller/role.controller';
import { SharedModule } from 'src/shared/shared.module';
// import { PermissionModule } from 'src/permission/permission.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { CompanyRoleModel } from './entity/company-role.entity';
import { CompanyRoleRepository } from './repository/company-role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleModel, CompanyRoleModel]), 
    SharedModule,
    forwardRef(() => EmployeeModule),
  ],
  controllers: [RoleController],
  providers: [RoleRepository, RoleService ,CompanyRoleRepository],
  exports: [RoleRepository, RoleService, CompanyRoleRepository]
})
export class RoleModule {}
