import { Either, left, right } from "@/shared";
import { Payload, PayloadRequest, PayloadResponse, TokenManager } from "@/usecases/authentication/ports";
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
    async sign(info: PayloadRequest, expiresIn: number = 60 * 60 * 24 * 30): Promise<string> {
        return jwt.sign({ data: info }, this.secret, { expiresIn })
    }

    async verify(token: string): Promise<Either<Error, PayloadResponse>> {
        try {
            const decoded = jwt.verify(token, this.secret) as PayloadResponse
            return right(decoded)
        } catch(error) {
            return left(error as Error)
        }
    }
    
}