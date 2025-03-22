import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
import { AfterLoad, Column, Entity, OneToMany, OneToOne } from 'typeorm';
// import { PagePermissionModel } from '../../permission/entity/page-permission.entity';
// import { ActionPermissionModel } from 'src/permission/entity/action-permission.entity';
import { appEnv } from 'src/shared/helpers/EnvHelper';
import { EmployeeModel } from 'src/employee/entity/employee.entity';
import { CompanyRoleModel } from './company-role.entity';

@Entity(`role`)
export class RoleModel extends PostgresBaseModel {
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'status',
    type: 'boolean',
    default: false,
  })
  status: boolean;

  // @OneToOne(
  //   () => PagePermissionModel,
  //   (page_permission) => page_permission.role,
  // )
  // page_permission: PagePermissionModel;

  // @OneToOne(
  //   () => ActionPermissionModel,
  //   (action_permission) => action_permission.role,
  // )
  // action_permission: ActionPermissionModel;

  @OneToMany(() => CompanyRoleModel, (company_role) => company_role.role)
  company_role: CompanyRoleModel[];

  @OneToMany(() => EmployeeModel, (employee) => employee.role)
employee: EmployeeModel[];

  @AfterLoad()
  castId() {
    this.id = +this.id;
  }
}
