import { Body, Controller, Param, ParseIntPipe, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { StorageService } from 'src/storage/storage.service';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
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
    async createPost(
        @AuthUser()
        userId: number,
        @Body() data: CreatePostDto,
        @UploadedFiles() pictures: Express.Multer.File[]
    ) { return await this.postService.create(userId, data, pictures) }

    @Patch(':postId')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor("pictures", 5, { limits: { fileSize: 1024 * 1024 * 5 } }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: "게시글 업데이트",
        description: "게시글을 업데이트합니다.",
    })
    async updatePost(
        @AuthUser()
        userId: number,
        @Param('postId', new ParseIntPipe())
        postId: number,
        @Body() data: UpdatePostDto,
        @UploadedFiles() pictures: Express.Multer.File[]
    ) { return await this.postService.update(userId, postId, data, pictures) }
}