
export interface SmsConfig {
    serviceId: string
    accessKey: string
    secretKey: string
    phoneNumber: string
}

export interface AuthCodeConfig {
    length: number
    expire: number
    redisUrl: string
}

export interface SessionConfig {
    redisUrl: string
}
