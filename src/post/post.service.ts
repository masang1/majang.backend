import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PostService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * 채팅방이 존재하는지 확인합니다.
     * @param postId 게시글 ID
     */
    async exists(postId: number): Promise<boolean> {
        return (await this.prisma.post.count({
            where: { id: postId },
        })) > 0;
    }
}