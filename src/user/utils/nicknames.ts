import { readFileSync } from "fs";
import { join } from "path";

export class NicknameGenerator {
    adjectives: string[]
    nouns: string[]

    constructor() {
        const { adjectives, nouns } = JSON.parse(readFileSync(join(__dirname, '../resources', 'nicknames.json'), 'utf8'))
        this.adjectives = adjectives
        this.nouns = nouns
    }

    generate(number_count: number): string {
        const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)]
        const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)]
        const number = number_count ? Math.floor(Math.random() * (10 ** number_count)) : ''
        return `${adjective}${noun}${number}`
    }
}

export default () => new NicknameGenerator()
