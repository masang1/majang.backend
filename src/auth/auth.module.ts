import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { AuthCodeConfig, SessionConfig } from 'config/interface';
import { SmsService } from './sms.service';

@Module({
  imports: [
    ConfigModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        readyLog: true,
        config: [
          {
            namespace: 'authCode',
            url: configService.get<AuthCodeConfig>('auth.authCode').redisUrl
          },
          {
            namespace: 'session',
            url: configService.get<SessionConfig>('auth.session').redisUrl
          }
        ]
      })
    }),
  ],
  providers: [
    SmsService,
    AuthService
  ]
})
export class AuthModule { }
