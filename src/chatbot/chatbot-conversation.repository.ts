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
    userId
  ) { 
    const pagination = GetPaginationOptions(data);
    const query = this.Repository.createQueryBuilder('conversation')
      .select([
        'conversation.id',
        'conversation.employee_id',
        'conversation.created_at',
        'conversation.updated_at',
        'conversation.name',
      ])
      .where('conversation.employee_id = :employee_id', {
        employee_id: userId ?? user.employee_id,
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
