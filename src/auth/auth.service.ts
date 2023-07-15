import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { SmsService } from './sms.service';
import { CreateSessionDto, CreateSessionResponseDto } from './auth.dto';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthCodeConfig } from 'config/interface';

@Injectable()
export class AuthService {
    authCodeConfig = this.configService.get<AuthCodeConfig>('auth.authCode')

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly smsService: SmsService,
        @InjectRedis('authCode')
        private readonly authCodeRedis: Redis,
        @InjectRedis('session')
        private readonly sessionRedis: Redis,
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

    async createSession(data: CreateSessionDto): Promise<CreateSessionResponseDto> {
        // 인증코드가 존재하지 않으면 휴대폰 번호로 인증코드를 발송합니다.

        if (data.code) {
            try {
                await this.sendAuthCode(data.phone)
            } catch {
                // 잘못된 전화번호
                return { code: 'invalid_phone' }
            }
            // 전송됨
            return { code: 'code_sent' }
        }

        // 인증코드를 검증합니다.
        if (!(await this.validateAuthCode(data.phone, data.code)))
            // 잘못된 인증코드
            return { code: 'invalid_code' }

        // 사용자 가져오기
        const user = this.userService.findByPhone(data.phone)

        if (!user && !data.force)
            // 사용자 생성이 불가능할 때.
            return { code: 'user_notfound' }


    }
}
