import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chat')
export class ChatbotController {
  constructor(private readonly chatService: ChatbotService) {}

  @Post('ask')
async chat(@Body('message') message: string, @Body('role') role: string) {
    const response = await this.chatService.sendMessage({ message, role });
    return { response };
  }
}
