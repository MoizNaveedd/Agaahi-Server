import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { appEnv } from 'src/shared/helpers/EnvHelper';
import { IRedisUserModel } from 'src/shared/interfaces/IRedisUserModel';
import { ChatBotDto } from './chatbot.dto';
import { RoleService } from 'src/role/role.service';
import Role from 'src/shared/enums/role-ims.enum';

@Injectable()
export class ChatbotService {
    private fastApiUrl = `${appEnv('CHAT_BOT_URL')}query`;  // URL of FastAPI service

    constructor(private readonly httpService: HttpService,
        private readonly roleService: RoleService
    ) {}

    public async SendMessage(userPrompt: ChatBotDto, user: IRedisUserModel): Promise<string> {
        const employeeRole = await this.roleService.GetRoleById(user.role_id);
        // console.log("here")
        // console.log(user.role_id)
        console.log(Role[user.role_id])
        console.log(Role[user.role_id].toString())
        try {
            const response = await firstValueFrom(
                this.httpService.post(this.fastApiUrl, { user_prompt: userPrompt.message , role: employeeRole.name })
                // this.httpService.post(this.fastApiUrl, { user_prompt: userPrompt.message , role: `${Role[user.role_id]}` })
            );
            return response.data.response;  // Extract response from FastAPI
        } catch (error) {
            throw new BadRequestException(`Failed to fetch response from chatbot: ${error.message}`);
        }
    }
}
