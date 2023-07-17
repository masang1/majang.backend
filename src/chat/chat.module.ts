import { PrismaService } from 'src/prisma.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PostModule } from 'src/post/post.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [
        ConfigModule,
        AuthModule,
        StorageModule,
        forwardRef(() => PostModule),
    ],
    controllers: [
        ChatController,
    ],
    providers: [
        ChatService,
        ChatGateway,
        PrismaService,
    ],
})
export class ChatModule { }
