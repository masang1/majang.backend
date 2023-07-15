import { ApiProperty } from "@nestjs/swagger"
import { User } from "@prisma/client"
import { IsOptional, IsString, Matches } from "class-validator"

export class UserProfileDto {
    @ApiProperty({ description: '사용자 ID' })
    id: number
    @ApiProperty({ description: '사용자 닉네임' })
    nickname: string
    @ApiProperty({ description: '사용자 프로필 사진 객체' })
    picture: string

    static of(user: User): UserProfileDto {
        return {
            id: user.id,
            nickname: user.nickname,
            picture: user.picture
        }
    }
}

export class UserDetailDto extends UserProfileDto {
    @ApiProperty({ description: '사용자 전화번호' })
    phone: string
    @ApiProperty({ description: '사용자 생성일' })
    createdAt: Date
    @ApiProperty({ description: '사용자 프로필 수정일' })
    updatedAt: Date

    static of(user: User): UserDetailDto {
        return {
            ...UserProfileDto.of(user),
            phone: user.phone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
}

export class UserUpdateDto {
    @IsOptional()
    @IsString()
    @Matches(/^[가-힣a-zA-Z0-9]{2,15}$/)
    @ApiProperty({ description: '사용자 닉네임' })
    nickname?: string
}

export class UserUpdateResponseDto {
    @ApiProperty({ description: '상태 코드' })
    code: 'updated' | 'unchanged' | 'nickname_duplicated'
    profile?: UserProfileDto
}