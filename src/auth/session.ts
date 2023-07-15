
/**
 * 세션 토큰
 */
export class SessionToken {
    constructor(public identifier: number, public signature: string) { }

    /**
     * 토큰
     */
    get token(): string {
        return `${this.identifier}:${this.signature}`
    }

    /**
     * 세션 토큰을 파싱합니다.
     */
    static parse(token: string): SessionToken | null {
        const [identifier_, signature] = token.split(':')
        const identifier = Number.parseInt(identifier_)

        if (isNaN(identifier) || !signature)
            return null

        return new SessionToken(identifier, signature)
    }
}
