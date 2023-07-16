import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateChatDto {
    @IsNumber()
    @ApiProperty({ description: '게시글 ID' })
    postId: number;
}
