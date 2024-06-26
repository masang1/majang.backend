import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { AuthCodeConfig, SessionConfig } from 'config/interface';
import { SmsService } from './sms.service';
import { SessionService } from './session.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
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
    SessionService,
    AuthService,
    PrismaService
  ],
  exports: [
    SessionService,
    AuthService
  ]
})
export class AuthModule { }
