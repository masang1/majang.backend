import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { StorageConfig } from 'config/interface';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
    readonly storageConfig = this.configService.get<StorageConfig>('storage.backbone')
    readonly backbone = new AWS.S3({
        accessKeyId: this.storageConfig.accessKey,
        secretAccessKey: this.storageConfig.secretKey,
        region: this.storageConfig.region,
    })

    constructor(
        private readonly configService: ConfigService,
    ) { }

    /**
     * 파일이 존재하는지 확인합니다.
     */
    async exists(filename: string): Promise<boolean> {
        try {
            await this.backbone.headObject({
                Bucket: this.storageConfig.bucket,
                Key: filename,
            }).promise()
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * 파일을 업로드합니다.
     * @param file 업로드할 파일
     * @param mimetype 파일의 MIME 타입
     * @param metadata 파일의 메타데이터
     */
    async upload(file: ArrayBufferLike, mimetype: string, metadata: { [key: string]: string } = {}): Promise<string> {
        const filename = randomBytes(16).toString('hex')
        const result = await this.backbone.upload({
            Bucket: this.storageConfig.bucket,
            Key: filename,
            Body: file,
            ContentType: mimetype,
            Metadata: metadata,
        }).promise()

        return filename
    }

    /**
     * 이미지를 업로드합니다.
     * @param file 원본 이미지 파일
     * @param size 변환할 이미지 크기
     * @param quality 이미지 품질 (0 ~ 100)
     * @param mode 이미지 크기 조정 모드
     * @param metadata 파일의 메타데이터
     */
    async uploadImage(
        file: ArrayBufferLike,
        size?: { width: number, height: number },
        quality: number = 80,
        mode: 'cover' | 'contain' = 'contain',
        metadata: { [key: string]: string } = {}
    ): Promise<string> {
        let image = sharp(file).rotate()

        if (size) {
            if (mode === 'cover') {
                image = image.resize(size.width, size.height, {
                    fit: 'cover',
                    position: 'center',
                })
            } else {
                image = image.resize(size.width, size.height, {
                    fit: 'outside',
                    withoutEnlargement: true,
                })
            }
        }

        const buffer = await image.jpeg({ quality }).toBuffer()
        return this.upload(buffer, 'image/jpeg', metadata)
    }

    /**
     * 파일을 삭제합니다.
     * @param filename 삭제할 파일명
     */
    async delete(filename: string): Promise<boolean> {
        try {
            await this.backbone.deleteObject({
                Bucket: this.storageConfig.bucket,
                Key: filename,
            }).promise()
            return true
        } catch (e) {
            return false
        }
    }
}
