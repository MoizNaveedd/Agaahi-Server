import { IsString } from "class-validator";

export class ChatBotDto {
    @IsString()
    message: string;
}