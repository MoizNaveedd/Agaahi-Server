import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
import { EmployeeModel } from 'src/employee/entity/employee.entity';
import { ChatHistoryModel } from './chatbot-history.entity';

@Entity('conversation')
export class ConversationModel extends PostgresBaseModel {
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  name: string;

  @Column({
    name: 'employee_id',
    type: 'bigint',
    nullable: false,
  })
  employee_id: number;

  @OneToMany(() => ChatHistoryModel, (chat_history) => chat_history.conversation)
  chat_history: ChatHistoryModel[];

  @ManyToOne(() => EmployeeModel, (employee) => employee.conversations)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'id' })
  employee: EmployeeModel;
}
