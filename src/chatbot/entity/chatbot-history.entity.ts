import { EmployeeModel } from 'src/employee/entity/employee.entity';
import { PostgresBaseModel } from 'src/shared/database/PostgresModel';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ConversationModel } from './chatbot-conversations.entity';

@Entity('chat_history')
export class ChatHistoryModel extends PostgresBaseModel {
  @Column({
    name: 'conversation_id',
    type: 'bigint',
    nullable: false,
  })
  conversation_id: number;

  @Column({
    name: 'user_prompt',
    type: 'text',
    nullable: true,
  })
  user_prompt: string;

  @Column({
    name: 'response',
    type: 'text',
    nullable: true,
  })
  response: string;

  @Column({
    name: 'base64_image',
    type: 'text',
    nullable: true,
  })
  base64_image: string;

  @Column({
    name: 'format',
    type: 'varchar',
    nullable: true,
  })
  format: string;

  @ManyToOne(
    () => ConversationModel,
    (conversation) => conversation.chat_history,
  )
  @JoinColumn({ name: 'conversation_id', referencedColumnName: 'id' })
  conversation: ConversationModel;
}
