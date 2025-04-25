export interface IChatMessage {
    user_prompt: string;
    response: string;
    conversation_id: number;
    image?: string;
    format?: string;
}