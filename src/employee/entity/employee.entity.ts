import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Language } from 'src/shared/enums/language.enum';
import { Gender } from 'src/shared/enums/gender.enum';
import { RoleModel } from 'src/role/entity/role.entity';
import { CompanyModel } from 'src/company/entity/company.entity';
import {  ConversationModel } from 'src/chatbot/entity/chatbot-conversations.entity';
import { DashboardChartsModel } from 'src/dashboard/entity/dashboard.entity';
import { DashboardLayoutModel } from 'src/dashboard/entity/dashboard-layout.entity';

@Entity(`employee`)
export class EmployeeModel extends PostgresBaseModel {
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'country_code',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  country_code: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone_number: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string;

  @Column({
    name: 'pin',
    type: 'varchar',
    length: 64,
    nullable: false,
    select: false,
  })
  pin: string;

  @Column({
    name: 'salary',
    type: 'bigint',
    nullable: true,
  })
  salary: number;

  @Column({
    name: 'status',
    type: 'boolean',
    default: false,
  })
  status: boolean;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'language',
    type: 'enum',
    enum: Language,
    nullable: true,
    default: Language.English,
  })
  language: Language;

  @Column({
    name: 'is_mfa_enabled',
    type: 'boolean',
    default: false,
    select: false,
  })
  is_mfa_enabled: boolean;

  @Column({
    name: 'mfa_secret',
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  mfa_secret: string;
 
  @Column({
    name: "gender",
    type: "enum",
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    name: 'image',
    type: 'varchar',
    nullable: true,
  })
  image: string;

  @Column({
    name: 'role_id',
    type: 'bigint',
    nullable: false,
  })
  role_id: number;

  @Column({
    name: 'company_id',
    type: 'bigint',
    nullable: false,
  })
  company_id: number;

  @Column({
    name: 'last_ims_login',
    type: 'timestamp',
    nullable: true,
  })
  last_ims_login: string;

  @Column({
    name: 'last_pos_login',
    type: 'timestamp',
    nullable: true,
  })
  last_pos_login: string;

  // @ManyToOne(() => CompanyRoleModel, (company_role) => company_role.employee, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'company_role_id', referencedColumnName: 'id' })
  // company_role: CompanyRoleModel;

  @ManyToOne(() => RoleModel, (role) => role.employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RoleModel;

  @ManyToOne(() => CompanyModel, (company) => company.employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: CompanyModel;

  @OneToMany(() => ConversationModel, (conversation) => conversation.employee)
  conversations: ConversationModel[];

  @OneToMany(() => DashboardChartsModel, (dashboard) => dashboard.employee)
  dashboard: DashboardChartsModel[];

  @OneToMany(() => DashboardLayoutModel, (dashboard) => dashboard.employee)
  dashboard_layout: DashboardLayoutModel[];

}
