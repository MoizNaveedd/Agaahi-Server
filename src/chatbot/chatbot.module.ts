import { Logger, Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { HttpModule } from '@nestjs/axios';
import { RoleModule } from 'src/role/role.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistoryRepository } from './chatbot.repository';
import { ChatHistoryModel } from './entity/chatbot-history.entity';
import { ChatConversationRepository } from './chatbot-conversation.repository';
import { ConversationModel } from './entity/chatbot-conversations.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatHistoryModel,ConversationModel]),
    HttpModule,
    RoleModule,
    SharedModule
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatHistoryRepository, ChatConversationRepository,
  ],
  exports: [ChatbotService, ChatHistoryRepository, ChatConversationRepository],
})
export class ChatbotModule {}
