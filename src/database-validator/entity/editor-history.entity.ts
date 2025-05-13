import { EmployeeModel } from "src/employee/entity/employee.entity";
import { PostgresBaseModel } from "src/shared/database/PostgresModel";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('editor_history')
export class EditorHistoryModel  extends PostgresBaseModel {
    @Column({
        name: 'employee_id',
        type: 'bigint',
        nullable: false,
    })
    employee_id: number;

    @Column({
        name: 'query',
        type: 'text',
        nullable: false,
    })
    query: string;

    @Column({
        name: 'user_prompt',
        type: 'text',
        nullable: false,
    })
    user_prompt: string;

    @Column({
        name: 'response',
        type: 'text',
        nullable: true,
    })
    response: string;
    
    @ManyToOne(() => EmployeeModel, (employee) => employee.editor_history)
    @JoinColumn({ name: 'employee_id' , referencedColumnName: 'id'})
    employee: EmployeeModel;
}