import { EmployeeModel } from "src/employee/entity/employee.entity";
import { PostgresBaseModel } from "src/shared/database/PostgresModel";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { DashboardLayoutModel } from "./dashboard-layout.entity";

@Entity('dashboard_charts')
export class DashboardChartsModel extends PostgresBaseModel {
  @Column({
    name: 'x_axis',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  x_axis: string;

  @Column({
    name: 'y_axis',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  y_axis: string;

  @Column({
    name: 'meta_info',
    type: 'text',
    nullable: true,
  })
  meta_info: string;

  @Column({
    name: 'sql_query',
    type: 'text',
    nullable: false,
  })
  sql_query: string;

  @Column({
    name: 'chart_id',
    type: 'bigint',
    nullable: false,
  })
  chart_id: number;

  @Column({
    name: 'employee_id',
    type: 'bigint',
    nullable: false,
  })
  employee_id: number;

  @ManyToOne(() => EmployeeModel, (employee) => employee.dashboard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: EmployeeModel;

  @OneToOne(() => DashboardLayoutModel, (layout) => layout.chart, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  dashboard_layout: DashboardLayoutModel;
}