import { Either, right } from "@/shared";
import { Payload, TokenManager } from "@/usecases/authentication/ports";
import * as jwt from 'jsonwebtoken'

export class JWtTokenManager implements TokenManager {
    private readonly secret: string

    constructor(secret: string) {
        this.secret = secret
    }

    async sign(info: Payload, expiresIn?: string | undefined): Promise<string> {
        return jwt.sign(info, this.secret, { expiresIn: '30d' })
    }

    async verify(token: string): Promise<Either<Error, Payload>> {
        const decoded = jwt.verify(token, this.secret) as Payload
        return right(decoded)
    }
    
}