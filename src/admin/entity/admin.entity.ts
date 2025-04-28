import { Column, Entity } from "typeorm";
import { Exclude } from "class-transformer";
import { PostgresBaseModel } from "src/shared/database/PostgresModel";
import { AdminRole } from "src/shared/enums/admin-role.enum";
import { appEnv } from "src/shared/helpers/EnvHelper";

@Entity(`${appEnv("TABLE_PREFIX","")}admin`)
export class AdminModel extends PostgresBaseModel {
  @Column({
    name: "full_name",
    type: "varchar",
    length: 255,
    nullable: false,
  })
  full_name: string;

  @Column({
    name: "country_code",
    type: "varchar",
    length: 5,
    nullable: false,
  })
  country_code: string;

  @Column({
    name: "phone_number",
    type: "varchar",
    length: 20,
    nullable: false,
  })
  phone_number: string;

  @Column({
    name: "email",
    type: "varchar",
    length: 255,
    nullable: false,
  })
  email: string;

  @Column({
    name: "password",
    type: "varchar",
    length: 64,
    nullable: false,
    select: false,
  })
  @Exclude()
  password: string;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
  })
  is_active: boolean;

  @Column({
    name: "role",
    type: "smallint",
    default: AdminRole.Admin,
  })
  role: AdminRole;

  @Column({
    name: "is_mfa_enabled",
    type: "boolean",
    default: false
  })
  is_mfa_enabled: boolean;

  @Column({
    name: "mfa_secret",
    type: "varchar",
    length: 256,
    nullable: true,
    select: false,
  })
  mfa_secret: string;
}