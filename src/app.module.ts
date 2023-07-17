import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { StorageModule } from './storage/storage.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import configuration from 'config/configuration';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { LoggingMiddleware } from './app/logging.middleware';

@Module({
  imports: [
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
