import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { NicknameGenerator } from './utils/nicknames';

@Injectable()
export class UserService {
    readonly nicknames = new NicknameGenerator();

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * 고유한 닉네임을 생성합니다.
     */
    async uniqueNickname(): Promise<string> {
        while (true) {
            const nickname = this.nicknames.generate(4);

            if (await this.prisma.user.count({ where: { nickname } }))
                continue;

            return nickname;
        }
    }

    /**
     * 기초 정보를 가진 사용자를 생성합니다.
     */
    async create(phone: string, nickname?: string): Promise<User> {
        return this.prisma.user.create({
            data: {
                phone,
                nickname: nickname ?? await this.uniqueNickname(),
            },
        });
    }

    /**
     * 전화번호로 사용자를 찾습니다.
     */
    async findByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { phone } });
    }
}