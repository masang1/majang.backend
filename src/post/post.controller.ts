import { Body, Controller, Get, Patch, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateSessionDto, CreateSessionResponseDto } from 'src/auth/dto/session.dto';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { PostDto, PostResultDto } from './dto/post.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { StorageService } from 'src/storage/storage.service';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
    constructor(
        private readonly authService: AuthService,
        private readonly postService: PostService,
        private readonly storageService: StorageService
    ) { }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor("pictures", { limits: { fileSize: 1024 * 1024 * 5, files: 5 } }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: "게시글 작성",
        description: "게시글을 작성합니다.",
    })
    async postpost(
        @AuthUser() user: User,
        @Body() data: PostDto,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        return this.postService.create(user, data, files);
    }

    // @Patch('@me')
    // @UseGuards(AuthGuard)
    // @UseInterceptors(FileInterceptor('picture', { limits: { fileSize: 1024 * 1024 * 5 } }))
    // @ApiConsumes('multipart/form-data')
    // @ApiOperation({
    //     summary: '사용자 프로필 수정',
    //     description: '사용자 프로필을 부분적으로 수정합니다.',
    // })
    // async update_profile(
    //     @AuthUser() user: User,
    //     @UploadedFile() picture: Express.Multer.File | undefined,
    //     @Body() data: UserUpdateDto
    // ): Promise<UserUpdateResponseDto> {
    //     return await this.userService.update(user, data, picture)
    // }
}