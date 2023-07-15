import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { CreateSessionDto, CreateSessionResponseDto } from 'src/auth/auth.dto';
import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly authService: AuthService) { }

    @Post()
    async login(@Body() data: CreateSessionDto): Promise<CreateSessionResponseDto> {
        return this.authService.createSession(data)
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async profile(@AuthUser() user: User): Promise<User> {
        return user
    }
}