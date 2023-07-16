/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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

    // @Get()
    // @UseGuards(AuthGuard)
    // @ApiOperation({
    //     summary: '사용자 채팅 목록 가져오기',
    //     description: '사용자가 참여한 채팅 목록을 가져옵니다.',
    // })
    // async previewChats(
    //     @AuthUser() user: User,
    // ) {
    //     return await this.chatService.previews(user.id)
    // }

    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 생성하기',
        description: '게시글에 대한 채팅방을 생성합니다.',
    })
    async createChat(
        @AuthUser() user: User,
        @Body() { postId }: CreateChatDto
    ) { return await this.chatService.create(user.id, postId) }

    @Get(':chatId')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 정보 가져오기',
        description: '채팅방의 정보를 가져옵니다.',
    })
    async getChat(
        @AuthUser() user: User,
        @Param() chatId: number
    ) { return await this.chatService.get(chatId, user.id) }

    @Delete(':chatId')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 나가기',
        description: '채팅방을 나갑니다.',
    })
    async leaveChat(
        @AuthUser() user: User,
        @Param() chatId: number
    ) { await this.chatService.leave(chatId, user.id) }

    @Get(':chatId/messages')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 메시지 가져오가',
        description: '채팅방 메시지를 가져옵니다',
    })
    async getMessages(
        @AuthUser() user: User,
        @Param() chatId: number,
        @Query() skip?: number
    ) { await this.chatService.getMessages(chatId, user.id, skip) }

    @Post(':chatId/messages')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 메시지 보내기',
        description: '채팅방 메시지를 보냅니다.',
    })
    async sendMessage(
        @AuthUser() user: User,
        @Param() chatId: number,
        @Query() skip?: number
    ) { await this.chatService.getMessages(chatId, user.id, skip) }
}
