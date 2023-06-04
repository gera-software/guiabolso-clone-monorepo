import { right } from "@/shared"

export class Token {
    public readonly type: string
    public readonly userId: string
    public readonly hash: string
    public readonly expireAt: Date

    private constructor(type: string, userId: string, hash: string, expireAt: Date) {
        this.type = type
        this.userId = userId
        this.hash = hash
        this.expireAt = expireAt
    }

    public static create(type: string, userId: string, hash: string, expireAt: Date) {
        return right(new Token(type, userId, hash, expireAt))
    } 
}