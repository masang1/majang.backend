import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NicknameGenerator } from './utils/nicknames';
import { UserDto, UserUpdateDto } from './dto/user-profile.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UserService {
    readonly nicknames = new NicknameGenerator();

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
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
    async create(phone: string, nickname?: string) {
        return this.prisma.user.create({
            data: {
                phone,
                nickname: nickname ?? await this.uniqueNickname(),
            },
        });
    }

    /**
     * 사용자 정보를 업데이트합니다.
     * @param userId 사용지 ID
     * @param data 업데이트할 사용자 정보
     * @param pictureFile 프로필 사진 파일
     */
    async update(userId: number, data: UserUpdateDto, pictureFile?: Express.Multer.File) {
        let user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
        let username: string | undefined = data.nickname ?? undefined;
        let picture: string | undefined = undefined;

        // 닉네임 중복을 확인합니다.
        if (!username || user.nickname === username)
            username = undefined;
        else if (await this.prisma.user.count({ where: { nickname: username } }))
            throw new BadRequestException({ code: 'nickname_duplicated' })

        // 프로필 사진을 업로드합니다.
        if (pictureFile) {
            picture = await this.storageService.uploadImage(
                pictureFile.buffer, 'xsmall', 'cover', { userId: user.id.toString() })
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
            profile: UserDto.of(user)
        }
    }

    async get(userId: number, detail: boolean) {
        return this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                id: true,
                nickname: true,
                picture: true,
                ...(detail ? {
                    phone: true,
                    createdAt: true,
                    updatedAt: true,
                } : {})
            }
        })
    }
}