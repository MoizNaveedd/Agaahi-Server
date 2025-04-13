import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { Repository } from 'typeorm';
import { ConversationModel } from './entity/chatbot-conversations.entity';
import { GetChatHistoryDto } from './dto/chatbot.dto';
import { IRedisAdminModel } from 'src/shared/interfaces/IRedisAdminModel';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { GetPaginationOptions } from 'src/shared/helpers/UtilHelper';

@Injectable()
export class ChatConversationRepository extends BaseRepository<ConversationModel> {
  constructor(
    @InjectRepository(ConversationModel)
    private chatConversationRepository: Repository<ConversationModel>,
  ) {
    super(chatConversationRepository);
  }

  public async GetChatConversationHistory(
    data: GetChatHistoryDto,
    user: IRedisUserModel,
  ) {
    if (typeof user.employee_id !== 'number') {
        throw new BadRequestException('Invalid employee ID');
      }
      
    const pagination = GetPaginationOptions(data);
    const query = this.Repository.createQueryBuilder('conversation')
      .select([
        'conversation.id',
        'conversation.employee_id',
        'conversation.created_at',
        'conversation.updated_at',
        'conversation.name',
        'chat_history.id',
        'chat_history.user_prompt',
        'chat_history.response',
      ])
      .leftJoin('conversation.chat_history', 'chat_history')
      .where('conversation.employee_id = :employee_id', {
        employee_id: user.employee_id,
      })
      .andWhere('conversation.is_deleted = 0')
      .orderBy('conversation.updated_at', 'DESC');
    if (pagination) {
      query.skip(pagination.offset).take(pagination.limit);
    }

    let [result, total] = await query.getManyAndCount();
    return { result, total };
  }
}
