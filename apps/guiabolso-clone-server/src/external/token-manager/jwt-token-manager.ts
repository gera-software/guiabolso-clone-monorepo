import { Either, left, right } from "@/shared";
import { Payload, TokenManager } from "@/usecases/authentication/ports";
import * as jwt from 'jsonwebtoken'

export class JwtTokenManager implements TokenManager {
    private readonly secret: string

    constructor(secret: string) {
        this.secret = secret
    }

    async sign(info: Payload, expiresIn?: string | undefined): Promise<string> {
        if(expiresIn) {
            return jwt.sign(info, this.secret, { expiresIn })
        }
        return jwt.sign(info, this.secret, { expiresIn: '30d' })
    }

    async verify(token: string): Promise<Either<Error, Payload>> {
        try {
            const decoded = jwt.verify(token, this.secret) as Payload
            return right(decoded)
        } catch(error) {
            return left(error as Error)
        }
    }
    
}