import { Either, left, right } from "@/shared";
import { JsonWebToken, Payload, TimeInSeconds, TokenManager } from "@/usecases/ports";
import * as jwt from 'jsonwebtoken'

export class JwtTokenManager implements TokenManager {
    private readonly secret: string

    constructor(secret: string) {
        this.secret = secret
    }

    /**
     * 
     * @param info 
     * @param expiresIn expiration time in seconds
     * @returns 
     */
    async sign(info: any, expiresIn: TimeInSeconds = 60 * 60 * 24 * 30): Promise<JsonWebToken> {
        return jwt.sign({ data: info }, this.secret, { expiresIn })
    }

    async verify(token: JsonWebToken): Promise<Either<Error, Payload>> {
        try {
            const decoded = jwt.verify(token, this.secret) as Payload
            return right(decoded)
        } catch(error) {
            return left(error as Error)
        }
    }
    
}