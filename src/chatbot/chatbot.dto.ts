import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChatBotDto {
    @ApiProperty({ example: "Hello, how many employees are there?" })
    @IsString()
    message: string;
}