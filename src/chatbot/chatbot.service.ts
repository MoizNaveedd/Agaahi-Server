import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { appEnv } from 'src/shared/helpers/EnvHelper';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { ChatBotDto, RenameConversation } from './chatbot.dto';
import { RoleService } from 'src/role/role.service';
import Role from 'src/shared/enums/role-ims.enum';
import { ChatHistoryRepository } from './chatbot.repository';
import { ConversationModel } from './entity/chatbot-conversations.entity';
import { ChatConversationRepository } from './chatbot-conversation.repository';
import { GetChatHistoryDto } from './dto/chatbot.dto';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  private fastApiUrl = `${appEnv('CHAT_BOT_URL')}query`; // URL of FastAPI service
  constructor(
    private readonly httpService: HttpService,
    private readonly roleService: RoleService,
    private readonly chatHistoryRepository: ChatHistoryRepository,
    private readonly chatConversationRepository: ChatConversationRepository,
  ) {}

  // public async SendMessage(
  //   userPrompt: ChatBotDto,
  //   user: IRedisUserModel,
  // ): Promise<string> {
  //   try {
  //     const [employeeRole, conversation] = await Promise.all([
  //       this.roleService.GetCompanyRoleDetails(user.role_id, user),
  //       this.getOrCreateConversationv2(userPrompt, user),
  //     ]);

  //     if(!employeeRole){
  //       throw new BadRequestException('Role has not been configured yet');
  //     }

  //     const response = await firstValueFrom(
  //       this.httpService.post(this.fastApiUrl, {
  //         user_prompt: userPrompt.message,
  //         role: employeeRole.role.name,
  //         allowed_tables: employeeRole.table_permission,
  //         history: conversation.chat_history
  //       }),
  //     );

  //     if(conversation.chat_history.length == 0){
  //       const response = await firstValueFrom(
  //         this.httpService.post(`${appEnv('CHAT_BOT_URL')}conversation-name`, {
  //           user_prompt: userPrompt.message,
  //         }),
  //       );

  //       await this.UpdateCoversationById(conversation.id, response.data.conversation_name);
  //     }

  //     await this.chatHistoryRepository.SaveChatHistory({
  //       conversation_id: conversation.id,
  //       user_prompt: userPrompt.message,
  //       response: response.data.response,
  //     });
  //     return response?.data.response; // Extract response from
  //   } catch (error) {
  //     throw new BadRequestException(
  //       `Failed to fetch response from chatbot: ${error}`,
  //     );
  //   }
  // }

//   private async getOrCreateConversation(
//     user: IRedisUserModel,
//     isNew: boolean,
//   ): Promise<ConversationModel> {
//     let conversation: ConversationModel;

//     if (isNew) {
//       conversation = new ConversationModel();
//       conversation.employee_id = user.employee_id;
//       await this.chatConversationRepository.Save(conversation); // Save the new conversation
//     } else {
//       conversation = await this.chatConversationRepository.FindOne({
//         where: { user_id: user.employee_id },
//         order: { created_at: 'DESC' },
//       });

//       if (!conversation) {
//         conversation = new ConversationModel();
//         conversation.employee_id = user.employee_id;
//         await this.chatConversationRepository.Save(conversation);
//       }
//     }

//     return conversation;
//   }

public async SendMessage(
  userPrompt: ChatBotDto,
  user: IRedisUserModel,
) {
  try {
    const [employeeRole, conversation] = await Promise.all([
      this.roleService.GetCompanyRoleDetails(user.role_id, user),
      this.getOrCreateConversationv2(userPrompt, user),
    ]);

    if (!employeeRole) {
      throw new BadRequestException('Role has not been configured yet');
    }

    const payload = {
      user_prompt: userPrompt.message,
      role: employeeRole.role.name.toLowerCase(),
      // allowed_tables: employeeRole.table_permission,
      // history: conversation.chat_history,
    };

    let chatbotResponse: string;
    let base64: string;
    let format: string;
    try {
      console.log(`${this.fastApiUrl}`, payload)
      const response = await axios.post(`${this.fastApiUrl}`, payload);
      console.log(response.data.response); // Optional debug log
      if (!response?.data?.response) {
        throw new Error('Invalid response from chatbot server');
      }


      chatbotResponse = response.data.response; // Assuming the structure is: { response: "..." }
      base64 = response.data.base64;
      format = response.data.format;
    } catch (error: any) {
      console.error('Error while sending request to chatbot server:', error?.message || error);
      throw new Error('Failed to communicate with chatbot server');
    }

    // Fire-and-forget block for background tasks
    setImmediate(async () => {
      try {
        // If it's a new conversation or empty history, get a conversation name
        if (conversation?.chat_history?.length == 0 || userPrompt.is_new) {
          const nameResponse = await firstValueFrom(
            this.httpService.post(`${appEnv('CHAT_BOT_URL')}conversation-name`, {
              user_prompt: userPrompt.message,
            }),
          );

          if (nameResponse?.data?.conversation_name) {
            await this.UpdateCoversationById(conversation.id, nameResponse.data.conversation_name);
          }
        }
        console.log("here")
        // Save chat history
        await this.chatHistoryRepository.SaveChatHistory({
          conversation_id: conversation.id,
          user_prompt: userPrompt.message,
          response: chatbotResponse,
          image: base64,
        });
      } catch (backgroundError) {
        console.error('Error in background operations:', backgroundError);
      }
    });


    return {
      response: chatbotResponse,
      base64: base64 ?? null,
      format: format ?? null,
      conversation_id: conversation.id,
    };
  } catch (error: any) {
    console.error('Chatbot Service Error:', error?.message || error);
    throw new BadRequestException(
      `Failed to fetch response from chatbot: ${error?.message || error}`,
    );
  }
}

// public async SendMessage(
//   userPrompt: ChatBotDto,
//   user: IRedisUserModel,
// ) {
//   try {
//     const [employeeRole, conversation] = await Promise.all([
//       this.roleService.GetCompanyRoleDetails(user.role_id, user),
//       this.getOrCreateConversationv2(userPrompt, user),
//     ]);

//     if (!employeeRole) {
//       throw new BadRequestException('Role has not been configured yet');
//     }

//     console.log("here")
//     console.log(this.fastApiUrl);

//     const payload = {
//       prompt: userPrompt.message,
//       // role: employeeRole.role.name,
//       // allowed_tables: employeeRole.table_permission,
//       // history: conversation.chat_history,

//     };

//     try {
//       const response = await axios.post(`${this.fastApiUrl}`, payload);
//       console.log(response.data.response);  // optional debug log

//       return response.data; // ✅ Directly return response.data
//     } catch (error) {
//       console.error('Error while sending request to chatbot server:', error.message);
//       throw new Error('Failed to communicate with chatbot server');
//     }
//   } catch (error) {
//     throw new BadRequestException(
//       `Failed to fetch response from chatbot: ${error}`,
//     );
//   }
// }


  private async getOrCreateConversationv2(data: ChatBotDto, user: IRedisUserModel) {
    const conversation = await this.chatConversationRepository.FindOne(
      { 
      employee_id: user.employee_id, 
      is_deleted: 0, 
      ...(data?.conversation_id && { id: data.conversation_id }) 
      },
      { relations: ['chat_history'] },
    );

    if (!conversation || data?.is_new) {
      return await this.CreateChatConversation(user);
    }
    return conversation;
  }

  public async GetChatHistory(
    params: GetChatHistoryDto,
    user: IRedisUserModel,
  ) {
    return await this.chatConversationRepository.GetChatConversationHistory(
      params,
      user,
    );
  }

  public async GetChatHistoryByConversationId(
    conversationId: number,
    user: IRedisUserModel,
  ) {
    return await this.chatConversationRepository.FindOne(
      {
        id: conversationId,
        employee_id: user.employee_id,
      },
      {
        relations: ['chat_history'],
      },
    );
  }

  public async CreateChatConversation(user: IRedisUserModel) {
    const conversationExist = await this.chatConversationRepository.FindOne(
      {
        employee_id: user.employee_id,
        is_deleted: 0,
      },
      { relations: ['chat_history'] },
    );

    if ((conversationExist?.chat_history?.length == 0)) {
      return conversationExist;
    }

    const conversation = new ConversationModel();
    conversation.employee_id = user.employee_id;
    conversation.name = null;
    return await this.chatConversationRepository.Save(conversation);
  }

  public async UpdateCoversationById(
    conversationId: number,
    request: RenameConversation,
  ){
    const conversation = await this.chatConversationRepository.FindOne({
      id: conversationId,
    });

    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    conversation.name = request.name;
    return await this.chatConversationRepository.Save(conversation);
  }

  public async DeleteConversationById(
    conversationId: number,
    user: IRedisUserModel
  ){
    const conversation = await this.GetChatHistoryByConversationId(
      conversationId,user)

    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    return await this.chatConversationRepository.DeleteById(conversationId,true);
  }
}
