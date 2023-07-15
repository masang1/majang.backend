import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsConfig } from 'config/interface';
import { SmsClient } from '@pickk/sens';

@Injectable()
export class SmsService {
    /**
     * SMS 구성
     */
    smsConfig = this.configService.get<SmsConfig>('auth.sms');
    /**
     * SMS 클라이언트
     */
    smsClient = new SmsClient({
        accessKey: this.smsConfig.accessKey,
        secretKey: this.smsConfig.secretKey,
        smsServiceId: this.smsConfig.serviceId,
        callingNumber: this.smsConfig.phoneNumber,
    });

    constructor(
        private readonly configService: ConfigService,
    ) { }


    /**
     * SMS 전송
     * @param phoneNumber 
     * @param message 
     * @returns 
     */
    async send(phoneNumber: string | string[], message: string) {
        return await this.smsClient.send({
            to: phoneNumber,
            content: message,
        });
    }
}
