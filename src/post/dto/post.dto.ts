import { ApiProperty } from "@nestjs/swagger"
import { PostType, SellMethod } from "@prisma/client"
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean, ValidateNested, IsNumber, Min, Max } from "class-validator"
import { Type, plainToInstance, Transform } from "class-transformer"

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

    @IsInt()
    @Max(9900000)
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
    @Transform(({ value }) =>
        plainToInstance(LocationDto, () => {
            try {
                return JSON.parse(value)
            }
            catch {
                return null
            }
        })
    )
    @ValidateNested()
    @ApiProperty({ description: '직거래 거래 장소' })
    location?: LocationDto

    @IsInt()
    @ApiProperty({ description: '게시글 카테고리 ID' })
    categoryId: number

    @IsOptional()
    @Transform(({ value }) =>
        plainToInstance(MetadataDto, () => {
            try {
                return JSON.parse(value)
            }
            catch {
                return null
            }
        })
    )
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