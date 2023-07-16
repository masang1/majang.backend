import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';

@Module({
    imports: [
        ConfigModule,
        StorageModule,
        forwardRef(() => AuthModule)
    ],
    controllers: [PostController],
    providers: [PostService, PrismaService],
    exports: [PostService]
})
export class PostModule { }