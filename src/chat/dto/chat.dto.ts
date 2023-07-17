import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class CreateChatDto {
    @IsInt()
    @Min(1)
    @ApiProperty({ description: '게시글 ID' })
    postId: number;
}
