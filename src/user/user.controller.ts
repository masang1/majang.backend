import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateSessionDto } from 'src/auth/dto/session.dto';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserUpdateDto } from './dto/user-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) { }

    @Post()
    @ApiOperation({
        summary: '사용자 세션 로그인',
        description: '사용자 세션을 생성합니다.\n기존 세션은 폐기됩니다.',
    })
    async login(@Body() data: CreateSessionDto) {
        return this.authService.createSession(data)
    }

    @Get(':userId')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: '사용자 프로필 가져오기',
        description: '사용자 프로필을 가져옵니다.',
    })
    async profile(
        @AuthUser() authId: number,
        @Param('userId') userId: number | '@me'
    ) {
        userId = userId === '@me' ? authId : +userId
        return await this.userService.get(userId, authId === userId)
    }

    @Patch('@me')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('picture', { limits: { fileSize: 1024 * 1024 * 5 } }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '사용자 프로필 수정',
        description: '사용자 프로필을 부분적으로 수정합니다.',
    })
    async update_profile(
        @AuthUser() userId: number,
        @UploadedFile() picture: Express.Multer.File | undefined,
        @Body() data: UserUpdateDto
    ) { return await this.userService.update(userId, data, picture) }
}