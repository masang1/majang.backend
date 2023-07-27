import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { SmsService } from './sms.service';
import { CreateSessionDto } from './dto/session.dto';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthCodeConfig } from 'config/interface';
import { SessionService } from './session.service';
import { SessionToken } from './session';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
    authCodeConfig = this.configService.get<AuthCodeConfig>('auth.authCode')

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly smsService: SmsService,
        private readonly sessionService: SessionService,
        @InjectRedis('authCode')
        private readonly authCodeRedis: Redis,
    ) { }

    /**
     * 인증코드를 전송합니다.
     * @param phone 전송할 전화번호
     * @returns 생성된 인증코드
     */
    async sendAuthCode(phone: string): Promise<string> {
        const code = Math.floor(Math.random() * (10 ** this.authCodeConfig.length)).toString()
            .padStart(this.authCodeConfig.length, '0')

        // 인증코드를 저장합니다.
        await this.authCodeRedis.set(phone, code, 'EX', this.authCodeConfig.expire)

        // 메시지를 전송합니다.
        await this.smsService.send(phone, this.authCodeConfig.messageFormat.format({
            code,
            expire: Math.floor(this.authCodeConfig.expire / 60)
        }))

        return code
    }

    /**
     * 인증코드를 검증합니다.
     * @param phone 전송된 전화번호
     * @param code 인증코드
     * @param once 확인 후 일치하면, 캐시에서 제거합니다.
     * @returns 일치여부
     */
    async validateAuthCode(phone: string, code: string, once: boolean = true): Promise<boolean> {
        const result = await this.authCodeRedis.get(phone) === code

        if (once && result) {
            // redis에서 제거합니다.
            await this.authCodeRedis.del(phone)
        }

        return result
    }

    /**
     * 세션을 생성합니다.
     * @param data 사용자 정보
     */
    async createSession(data: CreateSessionDto) {
        // 인증코드가 존재하지 않으면 휴대폰 번호로 인증코드를 발송합니다.

        if (!data.code) {
            try {
                await this.sendAuthCode(data.phone)
            } catch {
                // 잘못된 전화번호
                throw new BadRequestException({ code: 'invalid_phone' })
            }
            // 전송됨
            return { code: 'code_sent' }
        }

        // 인증코드를 검증합니다.
        if (!(await this.validateAuthCode(data.phone, data.code)))
            // 잘못된 인증코드
            throw new ForbiddenException({ code: 'invalid_code' })

        // 사용자 가져오기
        let user = await this.prisma.user.findUnique({
            where: { phone: data.phone },
            select: { id: true, deletedAt: true }
        })

        if (!user) {
            if (!data.force)
                // 사용자 생성이 불가능할 때.
                throw new NotFoundException({ code: 'user_notfound' })

            // 사용자 생성
            user = await this.userService.create(data.phone)
        }

        // 사용자가 차단되었는지 확인합니다.
        if (user.deletedAt)
            throw new ForbiddenException({ code: 'blocked' })

        // 세션 생성
        return {
            code: "authorized",
            token: (await this.sessionService.create(user.id)).token
        }
    }

    /**
     * 사용자 세션을 검증합니다.
     * @param token 세션 토큰
     */
    async validate(token: SessionToken | string) {
        token = await this.sessionService.validate(token)

        if (!token)
            return null

        return await this.prisma.user.count({
            where: { id: token.identifier },
        }) ? token : null
    }
}
