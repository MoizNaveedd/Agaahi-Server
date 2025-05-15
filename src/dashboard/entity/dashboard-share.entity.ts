import { EmployeeModel } from "src/employee/entity/employee.entity";
import { PostgresBaseModel } from "src/shared/database/PostgresModel";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('dashboard_share')
export class DashboardShareModel extends PostgresBaseModel {
    @Column({
        name: 'dashboard_owner_id',
        type: 'bigint',
        nullable: false,
    })
    dashboard_owner_id: number;

    @Column({
        name: 'shared_with',
        type: 'bigint',
        nullable: false,
    })
    shared_with: number;

    @ManyToOne((type) => EmployeeModel, (employee) => employee.dashboard_share)
    @JoinColumn({name: 'dashboard_owner_id', referencedColumnName: 'id'})
    employee: EmployeeModel;

    @ManyToOne((type) => EmployeeModel, (employee) => employee.shared_with)
    @JoinColumn({name: 'shared_with', referencedColumnName: 'id'})
    shared_with_employee: EmployeeModel;
}
