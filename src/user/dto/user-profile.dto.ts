import { ApiProperty } from "@nestjs/swagger"
import { User } from "@prisma/client"
import { IsOptional, IsString, Matches } from "class-validator"

export class UserDto {
    @ApiProperty({ description: '사용자 ID' })
    userId: number
    @ApiProperty({ description: '사용자 닉네임' })
    nickname: string
    @ApiProperty({ description: '사용자 프로필 사진 객체' })
    picture: string

    static of(user: User): UserDto {
        return {
            userId: user.id,
            nickname: user.nickname,
            picture: user.picture
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
