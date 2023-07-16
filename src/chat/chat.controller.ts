/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { AuthUser } from 'src/auth/auth.decorator';
import { User } from '@prisma/client';
import { CreateChatDto } from './dto/chat.dto';

@Controller('users/@me/chats')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
    ) { }

    @Get()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '사용자 채팅 목록 가져오기',
        description: '사용자가 참여한 채팅 목록을 가져옵니다.',
    })
    async previewChats(
        @AuthUser() user: User,
    ) {
        return await this.chatService.previews(user.id)
    }

    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 생성하기',
        description: '게시글에 대한 채팅방을 생성합니다.',
    })
    async createChat(
        @AuthUser() user: User,
        @Body() { postId }: CreateChatDto
    ) {

    }
}
