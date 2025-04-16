import { Controller, Post, Body, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import { ChatBotDto, RenameConversation } from './chatbot.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { GetChatHistoryDto } from './dto/chatbot.dto';

@Controller('chat')
export class ChatbotController {
  constructor(private readonly chatService: ChatbotService) {}

  @Authorized()
  @Post('ask')
  async chat(@Body() data: ChatBotDto, @CurrentUser() user: IRedisUserModel) {
    const response = await this.chatService.SendMessage(data, user);
    return { response };
  }

  @Authorized()
  @Get('history')
  async GetChatConversationHistory(
    @CurrentUser() user: IRedisUserModel,
    @Query() data: GetChatHistoryDto,
  ) {
    console.log('data', data);
    return await this.chatService.GetChatHistory(data, user);
  }

  @Authorized()
  @Get('/history/:conversationId')
  async GetChatHistoryByConversationId(
    @Param('conversationId') conversationId: number,
    @CurrentUser() user: IRedisUserModel,
  ) {
    return await this.chatService.GetChatHistoryByConversationId(
      conversationId,
      user,
    );
  }

  @Authorized()
  @Put('conversation')
  async CreateChatConversation(@CurrentUser() user: IRedisUserModel) {
    return await this.chatService.CreateChatConversation(user);
  }

  
  @Authorized()
  @Put('conversation/:conversationId')
  async UpdateConversationById(
    @Param('conversationId') conversationId: number,
    @Body() request : RenameConversation ,
  @CurrentUser() user: IRedisUserModel) {
    return await this.chatService.UpdateCoversationById(conversationId, request);
  }

  @Authorized()
  @Delete('conversation/:conversationId')
  async DeleteConversationById(
    @Param('conversationId') conversationId: number,
    @CurrentUser() user: IRedisUserModel,
  ) {
    return await this.chatService.DeleteConversationById(conversationId, user);
  }
}
