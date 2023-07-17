import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthUser } from 'src/auth/auth.decorator';
import { CreateChatDto } from './dto/chat.dto';
import { CreateMessageDto } from './dto/message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users/@me/chats')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
    ) { }

    @Get()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 목록 가져오기',
        description: '채팅방 목록을 가져옵니다.',
    })
    async getChats(
        @AuthUser()
        userId: number,
        @Query('page', new ParseIntPipe())
        page: number
    ) { return await this.chatService.all(userId, page) }

    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 생성하기',
        description: '게시글에 대한 채팅방을 생성합니다.',
    })
    async createChat(
        @AuthUser()
        userId: number,
        @Body()
        { postId }: CreateChatDto
    ) { return await this.chatService.create(userId, postId) }

    @Get(':chatId')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 정보 가져오기',
        description: '채팅방의 정보를 가져옵니다.',
    })
    async getChat(
        @AuthUser()
        userId: number,
        @Param('chatId', new ParseIntPipe())
        chatId: number
    ) { return await this.chatService.get(chatId, userId) }

    @Delete(':chatId')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 나가기',
        description: '채팅방을 나갑니다.',
    })
    async leaveChat(
        @AuthUser()
        userId: number,
        @Param('chatId', new ParseIntPipe())
        chatId: number
    ) { await this.chatService.leave(chatId, userId) }

    @Get(':chatId/messages')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '채팅방 메시지 가져오기',
        description: '채팅방 메시지를 가져옵니다',
    })
    async getMessages(
        @AuthUser()
        userId: number,
        @Param('chatId', new ParseIntPipe())
        chatId: number,
        @Query('skip', new ParseIntPipe())
        skip: number
    ) { return await this.chatService.messages(chatId, userId, skip) }

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
        @AuthUser()
        userId: number,
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
                userId, picture.buffer)
        }

        return this.chatService.message(chatId,
            userId, data.message)
    }
}
