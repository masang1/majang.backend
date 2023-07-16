import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PostDto } from './dto/post.dto';
import { User, PostImage, PostType, SellMethod, PresetType } from '@prisma/client';
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
            return { code: 'category_not_found' };

        let location: string | null = null;

        if (data.location)
            try {
                location = await this.locationUtil.reverseGeocode(
                    data.location.latitude, data.location.longitude
                );
            }
            catch
            {
                return { code: 'invalid_location' };
            }

        const item = await this.prisma.post.create({
            data: {
                authorId: user.id,
                type: PostType[data.type],
                categoryId: data.categoryId,
                title: data.title,
                content: data.content,
                price: data.price ? data.price : null,
                condition: data.condition ? data.condition : null,
                auctionUntil: data.auctionUntil ? new Date(Date.now() + data.auctionUntil) : null,
                location: location,
                sellMethod: SellMethod[data.sellMethod],
            }
        })

        for (const file of picture) {
            const fileId = await this.storageService.uploadImage(
                file.buffer,
                { width: 2160, height: 2160 },
                90, 'contain',
                { postId: item.id.toString() }
            );

            await this.prisma.postImage.create({
                data: {
                    postId: item.id,
                    imageId: fileId,
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

        return { code: 'success', data: item };
    }
}