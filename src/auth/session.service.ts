import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { SessionToken } from './session';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionService {
    constructor(
        @InjectRedis('session')
        private readonly sessionRedis: Redis,
    ) { }

    /**
     * 사용자 세션을 검증합니다.
     * @param token 세션 토큰
     */
    async validate(token: SessionToken | string): Promise<SessionToken | null> {
        if (!token)
            return null

        if (typeof token === 'string')
            token = SessionToken.parse(token)

        if (!token)
            return null

        return (await this.sessionRedis.get(token.identifier.toString()) === token.signature) ? token : null
    }

    /**
     * 세션 생성
     * @param identifier 사용자 식별자
     * @returns 세션 토큰
     */
    async create(identifier: number): Promise<SessionToken> {
        const signature = randomBytes(32).toString('hex')
        await this.sessionRedis.set(identifier.toString(), signature)
        return new SessionToken(identifier, signature)
    }

    /**
     * 세션 삭제
     * @param identifier 사용자 식별자
     */
    async delete(identifier: number): Promise<void> {
        await this.sessionRedis.del(identifier.toString())
    }

    /**
     * 세션 조회
     * @param identifier 사용자 식별자
     * @returns 세션 토큰
     */
    async get(identifier: number): Promise<SessionToken | null> {
        const signature = await this.sessionRedis.get(identifier.toString())
        return signature ? new SessionToken(identifier, signature) : null
    }
}
