import { BaseEntity, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

export abstract class BaseModel extends BaseEntity {
  @Column({
    name: 'created_at',
    type: 'bigint',
    nullable: true,
  })
  created_at;

  @Column({
    name: 'created_by',
    type: 'bigint',
    nullable: true,
  })
  created_by;

  @Column({
    name: 'updated_at',
    type: 'bigint',
    nullable: true,
  })
  updated_at;

  @Column({
    name: 'updated_by',
    type: 'bigint',
    nullable: true,
  })
  updated_by;

  @Column({
    name: 'is_deleted',
    type: 'smallint',
    default: 0,
  })
  is_deleted: number;

  @BeforeInsert()
  createDates() {
    if (!this.created_at) {
      this.created_at = Math.floor(Date.now() / 1000);
    }
    if (!this.updated_at) {
      this.updated_at = Math.floor(Date.now() / 1000);
    }
    this.is_deleted = 0;
  }

  @BeforeUpdate()
  updateDates() {
    this.updated_at = Math.floor(Date.now() / 1000);
  }
}
