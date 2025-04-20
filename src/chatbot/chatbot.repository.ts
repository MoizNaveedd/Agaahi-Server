import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/shared/database/BaseRepository';
import { IChatMessage } from 'src/shared/interfaces/IChatMessage.interface';
import { ChatHistoryModel } from './entity/chatbot-history.entity';

@Injectable()
export class ChatHistoryRepository extends BaseRepository<ChatHistoryModel> {
  constructor(
    @InjectRepository(ChatHistoryModel)
    private chatHistoryRepository: Repository<ChatHistoryModel>,
  ) {
    super(chatHistoryRepository);
  }

  public async SaveChatHistory(data: IChatMessage) {
    const chat = new ChatHistoryModel();
    chat.conversation_id = data.conversation_id;
    chat.user_prompt = data.user_prompt;
    chat.response = data.response;
    chat.base64_image = data.image;  
    return await this.Repository.save(chat);
  }
}
