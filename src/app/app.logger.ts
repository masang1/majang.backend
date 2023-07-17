import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
    private winstonLogger: winston.Logger
    constructor() {
        super()
        const loggerFormat = winston.format.printf(info =>
            `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`)
        const fileLoggerFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json(),
            loggerFormat
        )
        this.winstonLogger = winston.createLogger({
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: `logs/%DATE%-error.log`,
                    level: 'error',
                    format: fileLoggerFormat,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: false,
                }),
                new winston.transports.DailyRotateFile({
                    filename: `logs/%DATE%.log`,
                    format: fileLoggerFormat,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: false,
                }),
            ],
        })
    }

    log(message: string) {
        super.log(message);
        this.winstonLogger.info(message);
    }

    error(message: string, trace: string) {
        super.error(message, trace);
        this.winstonLogger.error(message, trace);
    }

    warn(message: string) {
        super.warn(message);
        this.winstonLogger.warn(message);
    }

    debug(message: string) {
        super.debug(message);
        this.winstonLogger.debug(message);
    }

    verbose(message: string) {
        super.verbose(message);
        this.winstonLogger.verbose(message);
    }
}
