import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { SmsService } from './sms.service';
import { CreateSessionDto } from './auth.dto';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthCodeConfig } from 'config/interface';

@Injectable()
export class AuthService {
    authCodeConfig = this.configService.get<AuthCodeConfig>('auth.authCode')

    constructor(
        private readonly configService: ConfigService,
        private readonly smsService: SmsService,
        // private readonly userService: UserService,
        @InjectRedis('authCode')
        private readonly authCodeRedis: Redis,
        @InjectRedis('session')
        private readonly sessionRedis: Redis,
    ) { }

    // async sendAuthCode(phone: string): Promise<string> {
    //     const code = Math.floor(Math.random() * (10 ** this.authCodeConfig.length)).toString()
    //         .padStart(this.authCodeConfig.length, '0')

    //     await this.authCodeRedis.set(phone, code, 'EX', this.authCodeConfig.expire)
    // }

    // async createSession(data: CreateSessionDto): Promise<Session> {
    //     // 인증코드가 존재하지 않으면 휴대폰 번호로 인증코드를 발송합니다.
    //     if (data.code) {

    //     }
    // }
}
