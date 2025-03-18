import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],  // Import HttpModule
  controllers: [ChatbotController],
  providers: [ChatbotService]
})
export class ChatbotModule {}
