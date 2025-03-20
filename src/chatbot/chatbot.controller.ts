import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { ChatBotDto } from './chatbot.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';

@Controller('chat')
export class ChatbotController {
  constructor(private readonly chatService: ChatbotService) {}

  @Authorized()
  @Post('ask')
  async chat(@Body() data: ChatBotDto, @CurrentUser() user: IRedisUserModel) {
    const response = await this.chatService.SendMessage(data, user);
    return { response };
  }
}
