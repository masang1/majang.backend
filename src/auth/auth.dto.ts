import { IsOptional, IsBoolean, IsMobilePhone, Length, IsNumberString } from 'class-validator';


export class CreateSessionDto {
    /**
     * 계정이 존재하지 않을 경우 생성할지 여부
     */
    @IsBoolean()
    readonly force: boolean;

    /**
     * 휴대폰 번호
     */
    @IsMobilePhone('ko-KR')
    readonly phone: string;

    /**
     * 인증 코드
     * @example 123456
     */
    @IsOptional()
    @IsNumberString()
    @Length(6, 6)
    readonly code: string | null;
}