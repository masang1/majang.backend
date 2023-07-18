import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessageType, PostStatus } from '@prisma/client';
import { ChatPageConfig } from 'config/interface';
import { PrismaService } from 'src/prisma.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class ChatService {
    readonly chatPageConfig = this.configService.get<ChatPageConfig>('chat.page')

    constructor(
        private event: EventEmitter2,
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
            where: {
                postId,
                participants: { some: { userId: creatorId } },
                deletedAt: null
            },
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
            where: {
                id: chatId,
                participants: { some: { userId: participantId } },
                deletedAt: null
            },
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
     * 채팅방 목록을 가져옵니다.
     * @param participantId 참여자 Id
     */
    async all(
        participantId?: number,
        page: number = 0,
    ) {
        const [lastReadAts, totalCount] = await this.prisma.$transaction([
            // 마지막으로 읽은 시간을 가져옵니다.
            this.prisma.chatParticipant.findMany({
                where: {
                    userId: participantId,
                    chat: { deletedAt: null }
                },
                select: {
                    id: true,
                    chatId: true,
                    lastReadAt: true,
                },
                skip: page * this.chatPageConfig.chat,
                take: this.chatPageConfig.chat,
            }),
            // 채팅방의 총 수를 가져옵니다.
            this.prisma.chatParticipant.count({
                where: {
                    userId: participantId,
                    chat: { deletedAt: null }
                },
            })
        ])

        if (!lastReadAts)
            return []

        // 읽지 않은 메시지 수를 구합니다.
        const unreadCounts: { [key: number]: number } = (await this.prisma.message.groupBy({
            by: ['chatId'],
            where: {
                senderId: { not: participantId },
                OR: lastReadAts.map(({ chatId, lastReadAt }) => ({
                    chatId,
                    createdAt: { gt: lastReadAt }
                }))
            },
            _count: { id: true }
        })).reduce((acc, { chatId, _count }) => {
            acc[chatId] = _count.id
            return acc
        }, {})

        const [chats] = await this.prisma.$transaction([
            // 채팅방 정보를 조회합니다.
            this.prisma.chat.findMany({
                where: { id: { in: lastReadAts.map(({ chatId }) => chatId) }, },
                select: {
                    id: true,
                    post: {
                        select: {
                            id: true,
                            type: true,
                            status: true,
                            images: {
                                take: 1,
                                select: { thumbnail: true }
                            },
                        }
                    },
                    participants: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    nickname: true,
                                    picture: true
                                }
                            }
                        }
                    },
                    messages: {
                        take: 1,
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            }),
        ])

        // 최신 메시지 순으로 정렬합니다.
        chats.sort((a, b) =>
            b.messages[0].createdAt.getTime() -
            a.messages[0].createdAt.getTime()
        )

        // 조회한 데이터를 정리하여 반환합니다.
        return {
            count: totalCount,
            total: Math.ceil(totalCount / this.chatPageConfig.chat),
            chats: chats.map(chat => ({
                ...chat,
                unreadCount: unreadCounts[chat.id] ?? 0
            }))
        }
    }

    /**
     * 채팅방 유저 정보 Id를 가져옵니다.
     * @param chatId 채팅방 Id
     * @param userId 유저 Id
     */
    async getParticipantId(chatId: number, userId: number, isNotDeleted: boolean = true) {
        return (await this.prisma.chatParticipant.findFirstOrThrow({
            where: {
                chatId,
                userId: userId,
                chat: { deletedAt: isNotDeleted ? null : undefined }
            },
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
                where: { id: chatId, deletedAt: null },
                data: { deletedAt: new Date() }
            })
        }
    }

    /**
     * 채팅방 메시지를 가져옵니다.
     * @param chatId 채팅방 Id
     * @param skip 스킵할 메시지 수 (주어진 값이 없으면 가장 최신 메시지를 조회하며, 아니면 가장 먼저 생긴 메시지 순으로 조회)
     */
    async messages(chatId: number, participantId: number, skip: number) {
        // 채팅방 참여 여부를 보장합니다.
        await this.getParticipantId(chatId, participantId)
        let skipR = Math.max(0, skip - this.chatPageConfig.message)
        let [messages, messageCount] = await this.prisma.$transaction([
            this.prisma.message.findMany({
                where: { chatId: chatId },
                take: this.chatPageConfig.message,
                skip: skipR,
                orderBy: {
                    createdAt: skip ? 'asc' : 'desc'
                }
            }),
            this.prisma.message.count({
                where: { chatId: chatId }
            })
        ])

        if (!skip) {
            // 생성 순으로 정렬합니다.
            messages = messages.reverse()
            skipR = Math.max(0, messageCount - this.chatPageConfig.message)
        }

        // 메시지의 index를 추가합니다.
        messages = messages.map((message, index) => ({
            index: skipR + index,
            ...message,
        }))

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
        type: MessageType = MessageType.text,
        ensure: boolean = true
    ) {
        // 채팅방 참여 여부를 보장합니다.
        if (ensure)
            await this.getParticipantId(chatId, senderId)

        let [message, messageCount]: [object, number] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: {
                    chatId,
                    senderId,
                    content,
                    type
                }
            }),
            this.prisma.message.count({
                where: { chatId: chatId }
            })
        ])

        message = {
            index: messageCount - 1,
            ...message,
        }

        // 채팅방 참여자에게 메시지를 전송합니다.
        this.event.emit('chat.message', message)

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
        console.log('asdfesfjosrdfgiolsrjnfsledfleasjflkjasljdes;oklfnsedal;k');
        await this.getParticipantId(chatId, senderId)
        const img = await this.storageService.uploadImage(
            image,
            'large',
            'contain',
            {
                chatId: chatId.toString(),
                userId: senderId.toString()
            }
        )

        return await this.message(
            chatId,
            senderId,
            img,
            MessageType.image,
            false
        )
    }
}
