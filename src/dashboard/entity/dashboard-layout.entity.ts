import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { PostgresBaseModel } from "src/shared/database/PostgresModel";
import { EmployeeModel } from "src/employee/entity/employee.entity";
import { DashboardChartsModel } from "./dashboard.entity";

@Entity('dashboard_layouts')
export class DashboardLayoutModel extends PostgresBaseModel {
  @Column({
    name: 'breakpoint',
    type: 'varchar',
    length: 10,
    nullable: false,
    default: 'lg',
  })
  breakpoint: string;

  @Column({
    name: 'width',
    type: 'int',
    nullable: false,
  })
  width: number;

  @Column({
    name: 'height',
    type: 'int',
    nullable: false,
  })
  height: number;

  @Column({
    name: 'position_x',
    type: 'int',
    nullable: false,
  })
  position_x: number;

  @Column({
    name: 'position_y',
    type: 'int',
    nullable: false,
  })
  position_y: number;

  @Column({
    name: 'is_static',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  is_static: boolean;

  @Column({
    name: 'employee_id',
    type: 'bigint',
    nullable: false,
  })
  employee_id: number;

  @Column({
    name: 'grid_i',
    type: 'int',
    nullable: true,
  })
  grid_i: number;

  data: any[];

  @ManyToOne(() => EmployeeModel, (employee) => employee.dashboard_layout, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: EmployeeModel;

  @Column({
    name: 'chart_id',
    type: 'bigint',
    nullable: false,
  })
  chart_id: number;

  @OneToOne(() => DashboardChartsModel, (chart) => chart.dashboard_layout)
  @JoinColumn({ name: 'chart_id', referencedColumnName: 'id' })
  chart: DashboardChartsModel;

}