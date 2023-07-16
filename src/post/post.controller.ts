import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateSessionDto, CreateSessionResponseDto } from 'src/auth/dto/session.dto';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { PostDto, PostEditDto } from './dto/post.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
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
    @UseInterceptors(FilesInterceptor("pictures", 5, { limits: { fileSize: 1024 * 1024 * 5 } }))
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

    @Patch(':id')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor("newImages", 5, { limits: { fileSize: 1024 * 1024 * 5 } }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: "게시글 수정",
        description: "게시글을 수정합니다.",
    })
    async updatepost(
        @AuthUser() user: User,
        @Body() data: PostEditDto,
        @UploadedFiles() newImages: Array<Express.Multer.File>,
        @Param('id') postId: number
    ) {
        return this.postService.edit(user, postId, data, newImages);
    }
}