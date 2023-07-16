import { ChatModule } from './chat/chat.module';
import { StorageModule } from './storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import configuration from 'config/configuration';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ChatModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    UserModule,
    AuthModule,
    PostModule,
    StorageModule,
    ChatModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
