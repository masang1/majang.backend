import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // @Get()
    // async getUsers(): Promise<UserResponseDto[]> {
    //     return (await this.userService.findAll()).map(UserResponseDto.of);
    // }
}