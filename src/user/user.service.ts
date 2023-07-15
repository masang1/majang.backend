import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { NicknameGenerator } from './utils/nicknames';
import { UserProfileDto, UserUpdateDto, UserUpdateResponseDto } from './dto/user-profile.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UserService {
    readonly nicknames = new NicknameGenerator();

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService
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

    /**
     * id로 사용자를 찾습니다.
     */
    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async update(user: User, data: UserUpdateDto, pictureFile?: Express.Multer.File): Promise<UserUpdateResponseDto> {
        let username: string | undefined = data.nickname ?? undefined;
        let picture: string | undefined = undefined;

        // 닉네임 중복을 확인합니다.
        if (!username || user.nickname === username) {
            username = undefined;
        } else if (await this.prisma.user.count({ where: { nickname: username } })) {
            return { code: 'nickname_duplicated' }
        }

        // 프로필 사진을 업로드합니다.
        if (pictureFile) {
            picture = await this.storageService.uploadImage(pictureFile.buffer,
                { width: 512, height: 512 }, 80, 'cover', { userId: user.id.toString() })
            // 기존 사진을 삭제합니다.
            if (user.picture) {
                await this.storageService.delete(user.picture)
            }
        }

        if (!username && !picture) {
            return { code: 'unchanged' }
        }

        // 사용자 정보를 업데이트합니다.
        user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                nickname: username,
                picture,
            }
        })

        return {
            code: 'updated',
            profile: UserProfileDto.of(user)
        }
    }
}