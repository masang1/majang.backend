import { Body, Controller, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
    @ApiOperation({
        summary: '게시글 작성',
        description: '게시글을 작성합니다.',
    })
    async postpost(@Body() data: PostDto): Promise<PostResultDto> {
        return { "code": "fail" }
    }
}