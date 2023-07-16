import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * 채팅방이 존재하는지 확인합니다.
     * @param participantId 참여자 ID
     * @param postId 게시글 ID
     */
    async exists(participantId: number, postId: number): Promise<boolean> {
        return (await this.prisma.chat.count({
            where: {
                participants: { some: { id: participantId } },
                post: { id: postId },
            },
        })) > 0;
    }

    /**
     * 채팅방을 생성합니다.
     */
    async create(
        creatorId: number,
        postId: number,
        participantIds?: number[]
    ) {
        if (!participantIds) {
            const post: Post = await this.prisma.post.findUnique({
                where: { id: postId },
                include: { author: true },
            });
            participantIds = [creatorId, post.authorId];
        }

        return this.prisma.chat.create({
            data: {
                post: { connect: { id: postId } },
                participants: { connect: participantIds.map(id => ({ id })) },
            },
        });
    }

    /**
     * 채팅방을 찾습니다.
     * @param participantId 참여자 ID
     * @param postId 게시글 ID
     */
    async find(
        participantId: number,
        postId: number,
    ) {
        return this.prisma.chat.findFirst({
            where: {
                participants: { some: { id: participantId } },
                post: { id: postId },
            },
        });
    }

    /**
     * 채팅방 미리보기 정보를 가져옵니다.
     * @param participantId 참여자 ID (User ID)
     */
    async previews(
        participantId: number,
    ) {
        // 채팅방의 마지막 읽은 시간을 가져옵니다.
        const lastReadAts = (await this.prisma.chatParticipant.findMany({
            where: { userId: participantId },
            select: { chatId: true, lastReadAt: true },
        }))

        // 채팅방의 읽지 않은 메시지 개수를 가져옵니다.
        const unreadCounts: { [key: number]: number } = {};

        for (const { chatId, lastReadAt } of lastReadAts) {
            unreadCounts[chatId] = await this.prisma.message.count({
                where: {
                    chatId,
                    createdAt: { gte: lastReadAt ?? new Date(0) }
                }
            });
        }

        // 채팅방의 정보를 가져옵니다.
        const chats = await this.prisma.chat.findMany({
            where: { participants: { some: { userId: participantId } }, },
            include: {
                post: {
                    select: {
                        // TODO: 게시글의 정보를 가져옵니다.
                        id: true,
                        title: true,
                    }
                },
                // 참여자 정보를 가져옵니다.
                participants: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                picture: true,
                            }
                        },
                        lastReadAt: true,
                    }
                },
                // 최근 메시지 1개만 가져옵니다.
                messages: {
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        type: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            }
        })

        // 채팅방의 정보를 정리합니다.
        return chats.map(chat => ({
            id: chat.id,
            post: chat.post,
            participants: chat.participants.map(p => p.user),
            unreadCount: unreadCounts[chat.id] ?? 0,
            lastMessage: chat.messages[0] ?? null,
            lastReadAt: chat.participants.find(p => p.user.id === participantId)?.lastReadAt,
        }))
    }
}
