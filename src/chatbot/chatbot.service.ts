import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { appEnv } from 'src/shared/helpers/EnvHelper';

@Injectable()
export class ChatbotService {
    private fastApiUrl = `${appEnv('CHAT_BOT_URL')}query`;  // URL of FastAPI service

    constructor(private readonly httpService: HttpService) {}

    async sendMessage(userPrompt: any): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(this.fastApiUrl, { user_prompt: userPrompt.message , role: userPrompt.role })
            );
            return response.data.response;  // Extract response from FastAPI
        } catch (error) {
            throw new Error(`Failed to fetch response from chatbot: ${error.message}`);
        }
    }
}
