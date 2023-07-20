import { HttpException } from "@nestjs/common";
import { ClassConstructor, plainToInstance } from "class-transformer";

export function jsonTransform(type: ClassConstructor<unknown>) {
    return ({ value }) => {
        try {
            return plainToInstance(type, JSON.parse(value))
        } catch {
            return plainToInstance(type, {})
        }
    }
}

export function stringArrayTransform({ value }) {
    let array: string[] = undefined

    try {
        array = JSON.parse(value)
    } catch {
        throw new HttpException({ code: 'invalid_string' }, 400)
    }

    for (const element of array) {
        if (typeof element !== 'string')
            throw new HttpException({ code: 'invalid_string_type' }, 400)
    }

    return array
}