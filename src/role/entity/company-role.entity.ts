// import {
//   AfterLoad,
//   Column,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   OneToMany,
// } from 'typeorm';
// import { CompanyModel } from '../../company/entity/company.entity';
// import { RoleModel } from 'src/role/entity/role.entity';
// import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
// import { EmployeeModel } from 'src/employee/entity/employee.entity';
// import { appEnv } from 'src/shared/helpers/EnvHelper';

// @Entity(`company_role`)
// export class CompanyRoleModel extends PostgresBaseModel {
//   @Column({
//     name: 'company_id',
//     type: 'bigint',
//     nullable: false,
//   })
//   company_id: number;

//   @Column({
//     name: 'role_id',
//     type: 'bigint',
//     nullable: false,
//   })
//   role_id: number;

//   @ManyToOne(() => CompanyModel, (company) => company.company_role, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
//   company: CompanyModel;

//   @ManyToOne(() => RoleModel, (role) => role.company_role, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
//   role: RoleModel;

//   @OneToMany(() => EmployeeModel, (employee) => employee.company_role)
//   employee: EmployeeModel[];

//   @AfterLoad()
//   castId() {
//     this.id = +this.id;
//     this.company_id = +this.company_id;
//     this.role_id = +this.role_id;
//   }
// }
