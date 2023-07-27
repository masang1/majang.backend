import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsMobilePhone, Length, IsNumberString } from 'class-validator';

export class CreateSessionDto {
    /**
     * 계정이 존재하지 않을 경우 생성할지 여부
     */
    @IsBoolean()
    @ApiProperty({ description: '계정이 존재하지 않을 경우 생성할지 여부' })
    public force: boolean;

    /**
     * 휴대폰 번호
     */
    @IsMobilePhone('ko-KR')
    @ApiProperty({ description: '휴대폰 번호' })
    public phone: string;

    /**
     * 인증 코드
     */
    @IsOptional()
    @IsNumberString()
    @Length(6, 6)
    @ApiProperty({ description: '인증 코드' })
    public code: string | null;
}
