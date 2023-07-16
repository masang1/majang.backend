import { PrismaService } from 'src/prisma.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        AuthModule,
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
