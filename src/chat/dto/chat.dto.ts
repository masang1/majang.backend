import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/user/dto/user-profile.dto";
import { MessageDto } from "./message.dto";
import { IsNumber } from "class-validator";
import { PostDto } from "src/post/dto/post.dto";
import { Chat, Message, MessageType, Post, User } from "@prisma/client";

export class CreateChatDto {
    @IsNumber()
    @ApiProperty({ description: '게시글 ID' })
    postId: number;
}
