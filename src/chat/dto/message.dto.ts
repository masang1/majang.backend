import { ApiProperty } from "@nestjs/swagger";
import { MessageType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsOptional, IsString, Length } from "class-validator";

export class CreateMessageDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Length(1, 500)
    message?: string
}