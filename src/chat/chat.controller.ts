/*
https://docs.nestjs.com/controllers#controllers
*/

import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthUser } from 'src/auth/auth.decorator';
import { User } from '@prisma/client';
import { CreateChatDto } from './dto/chat.dto';
import { CreateMessageDto } from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
        @AuthUser()
        user: User,
        @Param('chatId', new ParseIntPipe())
        chatId: number
    ) { return await this.chatService.get(chatId, user.id) }

    @Delete(':chatId')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 나가기',
        description: '채팅방을 나갑니다.',
    })
    async leaveChat(
        @AuthUser()
        user: User,
        @Param('chatId', new ParseIntPipe())
        chatId: number
    ) { await this.chatService.leave(chatId, user.id) }

    @Get(':chatId/messages')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 메시지 가져오기',
        description: '채팅방 메시지를 가져옵니다',
    })
    async getMessages(
        @AuthUser()
        user: User,
        @Param('chatId', new ParseIntPipe())
        chatId: number,
        @Query('skip', new ParseIntPipe())
        skip?: number
    ) { await this.chatService.getMessages(chatId, user.id, skip) }

    @Post(':chatId/messages')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('picture',
        { limits: { fileSize: 1024 * 1024 * 5 } }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '채팅방 메시지 보내기',
        description: '채팅방 메시지를 보냅니다.',
    })
    async sendMessage(
        @AuthUser() user: User,
        @Param('chatId', new ParseIntPipe())
        chatId: number,
        @UploadedFile()
        picture: Express.Multer.File | undefined,
        @Body()
        data: CreateMessageDto
    ) {
        if (picture && data.message)
            throw new BadRequestException()

        if (picture) {
            return await this.chatService.image(chatId,
                user.id, picture.buffer)
        }

        return this.chatService.message(chatId,
            user.id, data.message)
    }
}
