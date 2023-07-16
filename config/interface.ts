
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

export interface ImageConfig {
    quality: number
    size: number
}

export interface StorageImageConfig {
    xsmall: ImageConfig
    small: ImageConfig
    medium: ImageConfig
    large: ImageConfig
}

export interface NaverMapConfig {
    applicationName: string
    accessKeyId: string
    secretAccessKey: string
}

export interface ChatMessageConfig {
    pageSize: number
}