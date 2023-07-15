import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
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
    controllers: [UserController],
    providers: [UserService, PrismaService],
    exports: [UserService]
})
export class UserModule { }