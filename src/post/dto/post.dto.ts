import { ApiProperty } from "@nestjs/swagger"
import { PostStatus, PostType, SellMethod } from "@prisma/client"
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean, ValidateNested, IsNumber, Min, Max } from "class-validator"
import { Type, plainToInstance, Transform } from "class-transformer"

class LocationDto {
    @Transform(({ value }) => {
        const num = parseFloat(value)
        return isNaN(num) ? null : num
    })
    @IsNumber()
    @ApiProperty({ description: '위도' })
    latitude: number

    @Transform(({ value }) => {
        const num = parseFloat(value)
        return isNaN(num) ? null : num
    })
    @IsNumber()
    @ApiProperty({ description: '경도' })
    longitude: number
}

class MetadataDto {
    @IsString()
    @ApiProperty({ description: '메타데이터 키' })
    key: string

    @IsString()
    @ApiProperty({ description: '메타데이터 값' })
    value: string
}

export class PostDto {
    @IsEnum(PostType)
    @ApiProperty({ description: '게시글 종류 (팝니다: sell, 삽니다: buy, 경매: auction)' })
    type: string

    @IsString()
    @ApiProperty({ description: '게시글 제목' })
    title: string

    @IsString()
    @ApiProperty({ description: '게시글 내용' })
    content: string

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @Max(9900000)
    @ApiProperty({ description: '게시글 가격' })
    price: number

    @Transform(({ value }) => {
        return value == "true" ? true : false
    })
    @IsBoolean()
    @ApiProperty({ description: '배송비 포함 여부' })
    shippingIncluded: boolean

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(4)
    @ApiProperty({ description: '상품 상태' })
    condition?: number

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @IsOptional()
    @Min(3)
    @Max(30)
    @ApiProperty({ description: '경매 종료 일자' })
    auctionUntil?: number

    @IsOptional()
    @Transform(({ value }) => {
        try {
            return plainToInstance(LocationDto, JSON.parse(value))
        }
        catch {
            return plainToInstance(LocationDto, {})
        }
    })
    @ValidateNested({ each: true })
    @ApiProperty({ description: '직거래 거래 장소' })
    location?: LocationDto

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @ApiProperty({ description: '게시글 카테고리 ID' })
    categoryId: number

    @IsOptional()
    @Transform(({ value }) => {
        try {
            return plainToInstance(MetadataDto, JSON.parse(value))
        }
        catch {
            return plainToInstance(MetadataDto, {})
        }
    })
    @ValidateNested({ each: true })
    @ApiProperty({ description: '게시글 메타데이터' })
    metadata?: MetadataDto[]

    @IsEnum(SellMethod)
    @ApiProperty({ description: '상품 거래 방식' })
    sellMethod: string
}

export class PostEditDto {
    @IsEnum(PostStatus)
    @IsOptional()
    @ApiProperty({ description: '상품 상태' })
    postStatus?: string

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '기존에 등록된 이미지 ID 리스트' })
    existingImages?: string[]

    @IsString()
    @IsOptional()
    @ApiProperty({ description: '게시글 제목' })
    title?: string

    @IsString()
    @IsOptional()
    @ApiProperty({ description: '게시글 내용' })
    content?: string

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsOptional()
    @IsInt()
    @Max(9900000)
    @ApiProperty({ description: '게시글 가격' })
    price?: number

    @Transform(({ value }) => {
        return value == "true" ? true : false
    })
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: '배송비 포함 여부' })
    shippingIncluded?: boolean

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(4)
    @ApiProperty({ description: '상품 상태' })
    condition?: number

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @IsOptional()
    @Min(3)
    @Max(30)
    @ApiProperty({ description: '경매 종료 일자' })
    auctionUntil?: number

    @IsOptional()
    @Transform(({ value }) => {
        try {
            return plainToInstance(LocationDto, JSON.parse(value))
        }
        catch {
            return plainToInstance(LocationDto, {})
        }
    })
    @ValidateNested({ each: true })
    @ApiProperty({ description: '직거래 거래 장소' })
    location?: LocationDto

    @Transform(({ value }) => {
        const num = parseInt(value)
        return isNaN(num) ? null : num
    })
    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '게시글 카테고리 ID' })
    categoryId?: number

    @IsOptional()
    @Transform(({ value }) => {
        try {
            return plainToInstance(MetadataDto, JSON.parse(value))
        }
        catch {
            return plainToInstance(MetadataDto, {})
        }
    })
    @ValidateNested({ each: true })
    @ApiProperty({ description: '게시글 메타데이터' })
    metadata?: MetadataDto[]

    @IsEnum(SellMethod)
    @IsOptional()
    @ApiProperty({ description: '상품 거래 방식' })
    sellMethod?: string

}