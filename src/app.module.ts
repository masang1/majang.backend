import { StorageModule } from './storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import configuration from 'config/configuration';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    UserModule,
    AuthModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
