import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PostType, SellMethod, PostStatus } from '@prisma/client';
import { StorageService } from 'src/storage/storage.service';
import { LocationUtil } from './utils/location.util';
import { NaverMapConfig } from 'config/interface';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostService {
    readonly locationUtil = new LocationUtil(
        this.configService.get<NaverMapConfig>('map.naverMap')
    );

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * 게시글을 작성합니다.
     * @param user 작성자
     * @param data 게시글 데이터
     * @param picture 게시글 사진 리스트
     * @returns 작성된 게시글
     */
    async create(
        userId: number,
        data: CreatePostDto,
        pictures: Express.Multer.File[]
    ) {
        // 기초 데이터 검증을 수행합니다.
        // 내용 검증
        if (!data.title || !data.content)
            throw new HttpException({ 'code': 'invalid_content' }, 400)

        // 사진 갯수 검증
        if (!pictures.length)
            throw new HttpException({ 'code': 'invalid_pictures' }, 400)

        // 카테고리 검증
        if (!await this.prisma.postCategory.count({
            where: { id: data.category }
        })) throw new HttpException({ 'code': 'category_not_found' }, 404)

        // 경매 종료 날짜를 계산합니다.
        let auctionUntil: Date | null = null
        if (data.auctionUntil) {
            auctionUntil = new Date()
            auctionUntil.setDate(auctionUntil.getDate() + data.auctionUntil)
        }

        // 주소 검증
        let location: string | null = null
        if (data.location) {
            const { latitude, longitude } = data.location
            location = await this.locationUtil.reverseGeocode(
                latitude, longitude)
        }

        // 이미지를 업로드합니다.
        const pictureIds = await Promise.all(pictures.map(async picture => ({
            thumbnail: await this.storageService.uploadImage(
                picture.buffer, 'xsmall', 'cover', { userId: userId.toString() }),
            image: await this.storageService.uploadImage(
                picture.buffer, 'large', 'contain', { userId: userId.toString() }),
        })))

        // 상품을 추가합니다.
        return {
            postId: (await this.prisma.post.create({
                data: {
                    authorId: userId,
                    type: PostType[data.type],
                    status: 'default',
                    metadatas: {
                        create: data.metadata.map(metadata => ({
                            key: metadata.key,
                            value: metadata.value,
                        }))
                    },
                    categoryId: data.category,
                    images: { create: pictureIds },
                    title: data.title,
                    content: data.content,
                    price: data.price,
                    shippingIncluded: data.shippingIncluded,
                    condition: data.condition,
                    auctionUntil: auctionUntil,
                    location: location,
                    sellMethod: SellMethod[data.method],
                },
                select: { id: true }
            })).id
        }
    }

    /**
     * 게시글을 업데이트합니다.
     * @param userId 사용자 Id
     * @param postId 게시글 Id
     * @param data 업데이트 할 데이터
     * @param pictures 사진
     */
    async update(
        userId: number,
        postId: number,
        data: UpdatePostDto,
        pictures: Express.Multer.File[]
    ) {
        // 사진 갯수 검증
        if (!(pictures.length + data.keepPictures.length))
            throw new HttpException({ 'code': 'invalid_pictures' }, 400)
        // 카테고리 검증
        if (!await this.prisma.postCategory.count({
            where: { id: data.category }
        })) throw new HttpException({ 'code': 'category_not_found' }, 404)

        // 게시물 검증
        const posts = await this.prisma.post.findFirstOrThrow({
            where: { id: postId, authorId: userId },
            select: { images: { select: { image: true } } }
        })
        const images = posts.images.map(image => image.image)

        // 사진 무결성 확인
        if (await this.prisma.postImage.count({
            where: { image: { in: data.keepPictures } }
        }) != data.keepPictures.length)
            throw new HttpException({ code: 'image_not_found' }, 404)

        // 주소 검증
        let location: string | null = null
        if (data.location) {
            const { latitude, longitude } = data.location
            location = await this.locationUtil.reverseGeocode(
                latitude, longitude)
        }

        // 이미지를 업로드합니다.
        const pictureIds = await Promise.all(pictures.map(async picture => ({
            thumbnail: await this.storageService.uploadImage(
                picture.buffer, 'xsmall', 'cover', { userId: userId.toString() }),
            image: await this.storageService.uploadImage(
                picture.buffer, 'large', 'contain', { userId: userId.toString() }),
        })))

        return {
            postId: (await this.prisma.post.update({
                where: { id: postId, authorId: userId },
                data: {
                    authorId: userId,
                    status: PostStatus[data.status],
                    metadatas: {
                        // 메타데이터를 모두 지우고 새로 추가합니다.
                        deleteMany: {},
                        createMany: {
                            data: data.metadata ? data.metadata.map(metadata => ({
                                key: metadata.key,
                                value: metadata.value,
                            })) : []
                        }
                    },
                    categoryId: data.category,
                    images: {
                        deleteMany: {
                            // 전체이미지 차집합 보존할 이미지
                            image: { in: images.filter(image => !data.keepPictures.includes(image)) }
                        },
                        create: pictureIds,
                    },
                    title: data.title,
                    content: data.content,
                    price: data.price,
                    shippingIncluded: data.shippingIncluded,
                    condition: data.condition,
                    location: location,
                    sellMethod: SellMethod[data.method],
                },
                select: { id: true }
            })).id
        }
    }
}