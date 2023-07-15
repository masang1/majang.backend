
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
    messageFormat: string
}

export interface SessionConfig {
    redisUrl: string
}

export interface StorageConfig {
    bucket: string
    region: string
    accessKey: string
    secretKey: string
}
