import { BaseModel } from './BaseModel';
import { AfterLoad, PrimaryGeneratedColumn, AfterInsert } from 'typeorm';

export abstract class PostgresBaseModel extends BaseModel {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'bigint',
  })
  id: number;

  @AfterInsert()
  castId() {
    this.id = +this.id.toString();
  }

  @AfterLoad()
  convertDates() {
    this.id = +this.id.toString();
  }
}
