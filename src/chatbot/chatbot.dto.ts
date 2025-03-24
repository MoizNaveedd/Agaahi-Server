import { IsInt, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChatBotDto {
    @ApiProperty({ example: "Hello, how many employees are there?" })
    @IsString()
    message: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsOptional()
    conversation_id?: number;

}