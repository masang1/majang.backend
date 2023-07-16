import { ApiProperty } from "@nestjs/swagger"
import { PostType, SellMethod } from "@prisma/client"
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean, ValidateNested } from "class-validator"

class LocationDto {
    @ApiProperty({ description: '위도' })

    latitude: number

    @ApiProperty({ description: '경도' })
    longitude: number
}

class MetadataDto {
    @ApiProperty({ description: '메타데이터 키' })
    @IsString()
    key: string

    @ApiProperty({ description: '메타데이터 값' })
    @IsString()
    value: string
}

export class PostDto {
    @ApiProperty({ description: '게시글 종류 (팝니다: sell, 삽니다: buy, 경매: auction)' })
    @IsEnum(PostType)
    type: string

    @ApiProperty({ description: '게시글 제목' })
    @IsString()
    title: string

    @ApiProperty({ description: '게시글 내용' })
    @IsString()
    content: string

    @ApiProperty({ description: '게시글 가격' })
    @IsInt()
    price: number

    @ApiProperty({ description: '배송비 포함 여부' })
    @IsBoolean()
    shippingIncluded: boolean

    @ApiProperty({ description: '상품 상태' })
    @IsOptional()
    @IsInt()
    condition?: number

    @ApiProperty({ description: '경매 종료 일자' })
    @IsOptional()
    @IsInt()
    auctionUntil?: number

    @IsOptional()
    @ValidateNested()
    @ApiProperty({ description: '직거래 거래 장소' })
    location?: LocationDto

    @ApiProperty({ description: '게시글 카테고리 ID' })
    @IsInt()
    categoryId: number

    @IsOptional()
    @ValidateNested({ each: true })
    @ApiProperty({ description: '게시글 메타데이터' })
    metadata?: MetadataDto[]

    @IsEnum(SellMethod)
    @ApiProperty({ description: '상품 거래 방식' })
    sellMethod: string
}

export class PostResultDto {
    @ApiProperty({ description: '상태 코드' })
    code: 'success' | 'fail'
    @ApiProperty({ description: '게시글 ID' })
    postId?: number
}