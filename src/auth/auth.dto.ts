import { IsOptional, IsBoolean, IsMobilePhone, Length, IsNumberString } from 'class-validator';
import { ResponseDto } from 'src/base/response.dto';

export class CreateSessionDto {
    /**
     * 계정이 존재하지 않을 경우 생성할지 여부
     */
    @IsBoolean()
    public force: boolean;

    /**
     * 휴대폰 번호
     */
    @IsMobilePhone('ko-KR')
    public phone: string;

    /**
     * 인증 코드
     * @example 123456
     */
    @IsOptional()
    @IsNumberString()
    @Length(6, 6)
    public code: string | null;
}



export class CreateSessionResponseDto extends ResponseDto {
    code: 'authorized' | 'code_sent' | 'invalid_code' | 'invalid_phone' | 'blocked' | 'user_notfound'
    /**
     * 세션 토큰
     */
    token?: string
}