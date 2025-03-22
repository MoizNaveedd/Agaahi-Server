import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DatabaseType } from '../database-validator.dto';
import { CompanyModel } from 'src/company/entity/company.entity';

@Entity('database_connections')
export class DatabaseConnectionModel extends PostgresBaseModel {
  @Column({
    name: 'type',
    type: 'enum',
    enum: DatabaseType,
    nullable: false,
  })
  type: DatabaseType;

  @Column({
    name: 'host',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  host: string;

  @Column({
    name: 'port',
    type: 'int',
    nullable: false,
  })
  port: number;

  @Column({
    name: 'user',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  user: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'database',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  database: string;

  @Column({
    name: 'ssl',
    type: 'boolean',
    default: false,
  })
  ssl: boolean;

  @Column({
    name: 'company_id',
    type: 'int',
    nullable: false,
  })
  company_id: number;

  @OneToOne(() => CompanyModel, (company) => company.database_connection)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: CompanyModel;
}
