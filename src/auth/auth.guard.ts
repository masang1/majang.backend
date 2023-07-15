import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly authService: AuthService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const [type, token] = (request.headers['authorization'] as string ?? '').split(' ');

        if (type !== 'Bearer') {
            throw new UnauthorizedException();
        }

        const user = request['user'] = await this.authService.validate(token)
        return user ? true : false
    }
}