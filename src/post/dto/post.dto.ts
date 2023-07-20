import { ApiProperty } from "@nestjs/swagger"
import { PostStatus, PostType, SellMethod } from "@prisma/client"
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean, ValidateNested, IsNumber, Min, Max, IsNotEmpty, Length, ArrayMaxSize, ArrayMinSize, IsArray } from "class-validator"
import { Transform } from "class-transformer"
import { jsonTransform, stringArrayTransform } from "src/app/json.dto"

class LocationDto {
    @IsNumber()
    @ApiProperty({ description: '위도' })
    latitude: number

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

export class CreatePostDto {
    @IsEnum(PostType)
    @ApiProperty({ description: '게시글 종류 (팝니다: sell, 삽니다: buy, 경매: auction)' })
    type: string

    @IsString()
    @Length(1, 500)
    @Transform(({ value }) => value?.trim())
    @ApiProperty({ description: '게시글 제목' })
    title: string

    @IsString()
    @IsNotEmpty()
    @Length(1, 500)
    @Transform(({ value }) => value?.trim())
    @ApiProperty({ description: '게시글 내용' })
    content: string

    @IsInt()
    @Min(0)
    @Max(9000000)
    @ApiProperty({ description: '게시글 가격' })
    price: number

    @IsBoolean()
    @ApiProperty({ description: '배송비 포함 여부' })
    shippingIncluded: boolean

    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(4)
    @ApiProperty({ description: '상품 상태' })
    condition?: number

    @IsInt()
    @IsOptional()
    @Min(3)
    @Max(30)
    @ApiProperty({ description: '경매 종료 일자' })
    auctionUntil?: number

    @IsOptional()
    @ValidateNested({ each: true })
    @Transform(jsonTransform(LocationDto))
    @ApiProperty({ description: '직거래 거래 장소' })
    location?: LocationDto

    @IsInt()
    @ApiProperty({ description: '게시글 카테고리 ID' })
    category: number

    @IsOptional()
    @ValidateNested({ each: true })
    @Transform(jsonTransform(MetadataDto))
    @ApiProperty({ description: '게시글 메타데이터' })
    metadata?: MetadataDto[]

    @IsEnum(SellMethod)
    @ApiProperty({ description: '상품 거래 방식' })
    method: string
}


export class UpdatePostDto {
    @IsOptional()
    @IsEnum(PostStatus)
    @ApiProperty({ description: '게시글 상태' })
    status?: string

    @IsOptional()
    @IsString()
    @Length(1, 500)
    @Transform(({ value }) => value?.trim())
    @ApiProperty({ description: '게시글 제목' })
    title?: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Length(1, 500)
    @Transform(({ value }) => value?.trim())
    @ApiProperty({ description: '게시글 내용' })
    content?: string

    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(9000000)
    @ApiProperty({ description: '게시글 가격' })
    price?: number

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: '배송비 포함 여부' })
    shippingIncluded?: boolean

    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(4)
    @ApiProperty({ description: '상품 상태' })
    condition?: number

    @IsOptional()
    @ValidateNested({ each: true })
    @Transform(jsonTransform(LocationDto))
    @ApiProperty({ description: '직거래 거래 장소' })
    location?: LocationDto

    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '게시글 카테고리 ID' })
    category?: number

    @IsOptional()
    @ValidateNested({ each: true })
    @Transform(jsonTransform(MetadataDto))
    @ApiProperty({ description: '게시글 메타데이터' })
    metadata?: MetadataDto[]

    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(5)
    @Transform(stringArrayTransform)
    @ApiProperty({ description: '유지할 이미지' })
    keepPictures: string[]

    @IsEnum(SellMethod)
    @IsOptional()
    @ApiProperty({ description: '상품 거래 방식' })
    method?: string
}