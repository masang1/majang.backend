import { ApiProperty } from "@nestjs/swagger";
import { Message } from "@prisma/client";

export class MessageDto {
    @ApiProperty({ description: '메시지 ID' })
    messageId: number;
    @ApiProperty({ description: '메시지 작성자' })
    senderId: number;
    @ApiProperty({ description: '메시지 내용' })
    content: string;
    @ApiProperty({ description: '메시지 타입' })
    type: string;
    @ApiProperty({ description: '메시지 생성일' })
    createdAt: Date;

    static of(message: Message): MessageDto {
        return {
            messageId: message.id,
            senderId: message.senderId,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt,
        }
    }
}