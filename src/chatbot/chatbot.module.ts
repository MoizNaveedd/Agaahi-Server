import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { HttpModule } from '@nestjs/axios';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [HttpModule, RoleModule],  // Import HttpModule
  controllers: [ChatbotController],
  providers: [ChatbotService]
})
export class ChatbotModule {}
