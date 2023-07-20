import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    readonly logger = new Logger()

    public catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception.code === 'P2025') {
            return response.status(404)
                .json({ statusCode: 404, error: 'Entity not found' });
        }

        this.logger.error('Database exception', exception)

        return response.status(500)
            .json({ statusCode: 500, error: 'Unknown database exception' });
    }
}