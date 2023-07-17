import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PostDto, PostEditDto } from './dto/post.dto';
import { User, PostImage, PostType, SellMethod, PresetType, PostStatus } from '@prisma/client';
import { StorageService } from 'src/storage/storage.service';
import { LocationUtil } from './utils/location.util';
import { NaverMapConfig } from 'config/interface';
import { ConfigService } from '@nestjs/config';

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
     * 게시글이 존재하는지 확인합니다.
     * @param postId 게시글 ID
     */
    async exists(postId: number): Promise<boolean> {
        return (await this.prisma.post.count({
            where: { id: postId },
        })) > 0;
    }

    /**
     * 게시글을 작성합니다.
     * @param user 작성자
     * @param data 게시글 데이터
     * @param picture 게시글 사진 리스트
     * @returns 작성된 게시글
     */
    async create(user: User, data: PostDto, picture: Array<Express.Multer.File>) {
        const category = await this.prisma.postCategory.findUnique({
            where: { id: data.categoryId },
        });

        if (!category)
            throw new HttpException("category_not_found", HttpStatus.NOT_FOUND);

        let location: string | null = null;

        if (data.location)
            try {
                location = await this.locationUtil.reverseGeocode(
                    data.location.latitude, data.location.longitude
                );
            }
            catch
            {
                throw new HttpException("invalid_location", HttpStatus.BAD_REQUEST);
            }

        if (data.type === 'auction' && !data.auctionUntil)
            throw new HttpException("invalid_auctionuntil", HttpStatus.BAD_REQUEST);

        const item = await this.prisma.post.create({
            data: {
                authorId: user.id,
                type: PostType[data.type],
                categoryId: data.categoryId,
                title: data.title,
                content: data.content,
                price: data.price ? data.price : null,
                condition: data.condition ? data.condition : null,
                auctionUntil: data.auctionUntil ? new Date(Date.now() + (data.auctionUntil * 24 * 60 * 60 * 1000)) : null,
                location: location,
                sellMethod: SellMethod[data.sellMethod],
            }
        })
        for (const file of picture) {
            const fileId = await this.storageService.uploadImage(
                file.buffer,
                'large',
                'contain',
                { postId: item.id.toString() }
            );

            const thumbnailId = await this.storageService.uploadImage(
                file.buffer,
                'small',
                'cover',
                { postId: item.id.toString() }
            );


            await this.prisma.postImage.create({
                data: {
                    postId: item.id,
                    image: fileId,
                    thumbnail: thumbnailId,
                }
            })
        }

        for (const metadata of data.metadata) {
            // add postmetadatapreset if not exists
            let key = await this.prisma.postMetadataPreset.findFirst({
                where: { content: metadata.key, type: PresetType["key"] },
            });

            if (!key) {
                key = await this.prisma.postMetadataPreset.create({
                    data: {
                        content: metadata.key,
                        type: PresetType["key"],
                    }
                })
            }

            let value = await this.prisma.postMetadataPreset.findFirst({
                where: { content: metadata.value, type: PresetType["value"] },
            });

            if (!value) {
                value = await this.prisma.postMetadataPreset.create({
                    data: {
                        content: metadata.value,
                        type: PresetType["value"],
                    }
                })
            }

            await this.prisma.postMetadata.create({
                data: {
                    postId: item.id,
                    keyId: key.id,
                    valueId: value.id,
                }
            })
        }

        return { code: 'success', itemId: item.id };
    }

    /**
     * 게시글을 수정합니다.
     * @param user 작성자 유저 객체
     * @param postId 게시글 ID
     * @param data 수정 데이터
     * @param newImages 새로 추가된 이미지
     */
    async edit(user: User, postId: number, data: PostEditDto, newImages: Array<Express.Multer.File>) {
        const post = await this.prisma.post.findUniqueOrThrow({
            where: { id: postId },
        });

        if (post.authorId !== user.id) {
            throw new ForbiddenException();
        }

        if (data.existingImages || newImages) {
            const existingImages = await this.prisma.postImage.findMany({
                where: { postId: postId },
            });

            const keepImages = data.existingImages ? data.existingImages : [];
            const deleteImages = existingImages.filter(image => !keepImages.includes(image.image));

            for (const image of deleteImages) {
                await this.storageService.delete(image.image);
                await this.storageService.delete(image.thumbnail);
                await this.prisma.postImage.delete({
                    where: { image: image.image },
                })
            }

            for (const file of newImages) {
                const fileId = await this.storageService.uploadImage(
                    file.buffer,
                    'large',
                    'contain',
                    { postId: postId.toString() }
                );

                const thumbnailId = await this.storageService.uploadImage(
                    file.buffer,
                    'small',
                    'cover',
                    { postId: postId.toString() }
                );

                await this.prisma.postImage.create({
                    data: {
                        postId: postId,
                        image: fileId,
                        thumbnail: thumbnailId,
                    }
                })
            }
        }

        if (data.postStatus) {
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    status: PostStatus[data.postStatus],
                }
            })
        }

        if (data.title) {
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    title: data.title,
                }
            })
        }

        if (data.content) {
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    content: data.content,
                }
            })
        }

        if (data.price) {
            if (data.sellMethod == 'auction') {
                await this.prisma.post.update({
                    where: { id: postId },
                    data: {
                        price: data.price,
                    }
                })
            }
        }

        if (data.condition) {
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    condition: data.condition,
                }
            })
        }

        if (data.location) {
            try {
                const location = await this.locationUtil.reverseGeocode(
                    data.location.latitude, data.location.longitude
                );

                await this.prisma.post.update({
                    where: { id: postId },
                    data: {
                        location: location,
                    }
                })
            }
            catch
            {
                throw new HttpException("invalid_location", HttpStatus.BAD_REQUEST);
            }
        }

        if (data.categoryId) {
            const category = await this.prisma.postCategory.findUniqueOrThrow({
                where: { id: data.categoryId },
            });

            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    categoryId: category.id,
                }
            })
        }

        if (data.metadata) {
            // remove all metadata
            await this.prisma.postMetadata.deleteMany({
                where: { postId: postId },
            })

            for (const metadata of data.metadata) {
                // add postmetadatapreset if not exists
                let key = await this.prisma.postMetadataPreset.findFirst({
                    where: { content: metadata.key, type: PresetType["key"] },
                });
    
                if (!key) {
                    key = await this.prisma.postMetadataPreset.create({
                        data: {
                            content: metadata.key,
                            type: PresetType["key"],
                        }
                    })
                }
    
                let value = await this.prisma.postMetadataPreset.findFirst({
                    where: { content: metadata.value, type: PresetType["value"] },
                });
    
                if (!value) {
                    value = await this.prisma.postMetadataPreset.create({
                        data: {
                            content: metadata.value,
                            type: PresetType["value"],
                        }
                    })
                }
    
                await this.prisma.postMetadata.create({
                    data: {
                        postId: postId,
                        keyId: key.id,
                        valueId: value.id,
                    }
                })
            }
        }

        if (data.sellMethod) {
            await this.prisma.post.update({
                where: { id: postId },
                data: {
                    sellMethod: SellMethod[data.sellMethod],
                }
            })
        }

        return { code: 'success' };
    }
}