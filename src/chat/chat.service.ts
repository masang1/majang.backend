import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageType, PostStatus } from '@prisma/client';
import { ChatMessageConfig } from 'config/interface';
import { PrismaService } from 'src/prisma.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class ChatService {
    readonly messageConfig = this.configService.get<ChatMessageConfig>('chat.message')

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly storageService: StorageService
    ) { }

    /**
     * 채팅방을 만듭니다.
     * @param creatorId 생성자 Id
     * @param postId 게시글 Id
     */
    async create(creatorId: number, postId: number) {
        // 게시글이 존재하는지 확인합니다.
        const post = await this.prisma.post.findUniqueOrThrow({
            where: { id: postId, status: PostStatus.default },
            select: { authorId: true },
        })

        // 게시글 작성자와 채팅방 생성자가 같은지 확인합니다.
        if (post.authorId === creatorId)
            throw new BadRequestException()

        // 채팅방이 이미 존재하는지 확인합니다.
        const chat = await this.prisma.chat.findFirst({
            where: { postId, participants: { some: { userId: creatorId } } },
            select: { id: true },
        })

        if (chat)
            return { chatId: chat.id }

        // 채팅방을 생성합니다.
        const newChat = await this.prisma.chat.create({
            data: {
                post: { connect: { id: postId } },
                participants: {
                    create: [
                        { userId: creatorId, lastReadAt: new Date() },
                        { userId: post.authorId, lastReadAt: new Date() },
                    ]
                },
            },
            select: { id: true },
        })

        return { chatId: newChat.id }
    }

    /**
     * 채팅방 정보를 가져옵니다.
     * @param chatId 채팅방 Id
     * @param participantId 참여자 Id
     */
    async get(chatId: number, participantId?: number) {
        return await this.prisma.chat.findUniqueOrThrow({
            where: { id: chatId, participants: { some: { userId: participantId } } },
            select: {
                id: true,
                post: {
                    select: {
                        id: true,
                        author: {
                            select: { id: true, nickname: true, picture: true }
                        },
                        type: true,
                        status: true,
                        images: {
                            take: 1,
                            select: { thumbnail: true }
                        },
                        title: true,
                        price: true,
                    }
                },
                participants: {
                    select: {
                        user: {
                            select: { id: true, nickname: true, picture: true }
                        }
                    }
                }
            }
        })
    }

    /**
     * 채팅방 유저 정보 Id를 가져옵니다.
     * @param chatId 채팅방 Id
     * @param userId 유저 Id
     */
    async getParticipantId(chatId: number, userId: number) {
        return (await this.prisma.chatParticipant.findFirstOrThrow({
            where: { chatId, userId: userId },
            select: { id: true },
        })).id
    }

    /**
     * 채팅방을 나갑니다.
     * @param chatId 채팅방 Id
     * @param participantId 참여자 Id
     */
    async leave(chatId: number, participantId: number) {
        // 채팅방 참여자 제거
        await this.prisma.chatParticipant.delete({
            where: { id: await this.getParticipantId(chatId, participantId) }
        })

        // 채팅방 참여자가 0명이면 채팅방을 삭제합니다.
        if (await this.prisma.chatParticipant.count({ where: { chatId: chatId } }) === 0) {
            await this.prisma.chat.update({
                where: { id: chatId },
                data: { deletedAt: new Date() }
            })
        }
    }

    /**
     * 채팅방 메시지를 가져옵니다.
     * @param chatId 채팅방 Id
     * @param skip 스킵할 메시지 수 (주어진 값이 없으면 가장 최신 메시지를 조회하며, 아니면 가장 먼저 생긴 메시지 순으로 조회)
     */
    async getMessages(chatId: number, participantId: number, skip?: number) {
        // 채팅방 참여 여부를 보장합니다.
        await this.getParticipantId(chatId, participantId)

        const [messages, messageCount] = await this.prisma.$transaction([
            this.prisma.message.findMany({
                where: { chatId: chatId },
                take: this.messageConfig.pageSize,
                skip: Math.max(0, skip - this.messageConfig.pageSize),
                orderBy: {
                    // page가 주어지지 않으면 가장 최근 항목을 조회한다.
                    createdAt: skip ? 'asc' : 'desc'
                }
            }),
            this.prisma.message.count({
                where: { chatId: chatId }
            })
        ])

        return { messages, messageCount }
    }

    /**
     * 메시지를 생성합니다
     * @param chatId 채팅 Id
     * @param senderId 전송자 Id
     * @param content 메시지 내용
     * @param type 메시지 타입
     */
    async message(
        chatId: number,
        senderId: number,
        content: string,
        type: MessageType,
        ensure: boolean = true
    ) {
        // 채팅방 참여 여부를 보장합니다.
        if (ensure)
            await this.getParticipantId(chatId, senderId)

        const message = await this.prisma.message.create({
            data: {
                chatId,
                senderId,
                content,
                type
            }
        })

        return message
    }

    /**
     * 이미지 메시지를 보냅니다.
     * @param chatId 채팅방 Id
     * @param senderId 전송자 Id
     * @param image 이미지 데이터
     */
    async image(
        chatId: number,
        senderId: number,
        image: ArrayBufferLike,
    ) {
        await this.getParticipantId(chatId, senderId)
        return await this.message(
            chatId,
            senderId,
            await this.storageService.uploadImage(
                image,
                'large',
                'contain',
                {
                    chatId: chatId.toString(),
                    userId: senderId.toString()
                }
            ),
            MessageType.image,
            false
        )
    }
}
