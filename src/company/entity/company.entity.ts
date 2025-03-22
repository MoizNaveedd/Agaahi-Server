import { Language } from 'src/shared/enums/language.enum';
import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
import { AfterLoad, Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { EmployeeModel } from 'src/employee/entity/employee.entity';
import { DatabaseConnectionModel } from 'src/database-validator/entity/database-connection.entity';
import { CompanyRoleModel } from 'src/role/entity/company-role.entity';

@Entity(`company`)
export class CompanyModel extends PostgresBaseModel {
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'country_code',
    type: 'varchar',
    length: 5,
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
    name: 'password',
    type: 'varchar',
    length: 128,
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    name: 'language',
    type: 'enum',
    enum: Language,
    default: Language.English,
  })
  language: Language;

  @Column({
    name: 'logo',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  logo: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    nullable: false,
  })
  first_name: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    nullable: false,
  })
  last_name: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  is_active: boolean;

  @Column({
    name: 'is_email_verified',
    type: 'boolean',
    default: false,
    select: true,
  })
  is_email_verified: boolean;

  @Column({
    name: 'is_phone_verified',
    type: 'boolean',
    default: false,
    select: true,
  })
  is_phone_verified: boolean;

  @OneToMany(() => CompanyRoleModel, (company_role) => company_role.company)
  company_role: CompanyRoleModel[];

  @OneToMany(() => EmployeeModel, (employee) => employee.role)
  employee: EmployeeModel[];

  @OneToOne(() => DatabaseConnectionModel, (database_connection) => database_connection.company)
  database_connection: DatabaseConnectionModel;

  //   @OneToMany(() => WarehouseModel, (warehouse) => warehouse.company)
  //   warehouse: WarehouseModel[];

  //   @OneToMany(() => CompanyCategoryModel, (category) => category.company)
  //   category: CompanyCategoryModel[];

  //   @OneToMany(() => StoreModel, (store) => store.company)
  //   store: StoreModel[];

  //   @OneToMany(() => CustomerModel, (customer) => customer.company)
  //   customer: CustomerModel[];

  //   @OneToMany(() => CompanyRoleModel, (company_role) => company_role.company)
  //   company_role: CompanyRoleModel[];

  //   @OneToMany(() => SupplierModel, (supplier) => supplier.company)
  //   supplier: SupplierModel[];

  //   @OneToOne(
  //     () => CompanySettingModel,
  //     (company_setting) => company_setting.company,
  //   )
  //   company_setting: CompanySettingModel;

  //   @OneToMany(
  //     () => CompanyPaymentMethodModel,
  //     (company_payment_type) => company_payment_type.company,
  //   )
  //   company_payment_type: CompanyPaymentMethodModel[];

  @AfterLoad()
  castId() {
    this.id = +this.id;
  }
  //   async afterLoad() {
  //     if (this.logo) {
  //       this.logo = await GetAWSSignedUrl(this.logo);
  //     }
  //   }
}
