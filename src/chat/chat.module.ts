import { PrismaService } from 'src/prisma.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
/*
https://docs.nestjs.com/modules
*/

import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PostModule } from 'src/post/post.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        AuthModule,
        forwardRef(() => PostModule),
    ],
    controllers: [
        ChatController,
    ],
    providers: [
        ChatService,
        PrismaService
    ],
})
export class ChatModule { }
