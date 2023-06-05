import { Either, left, right } from "@/shared";
import { JsonWebToken, Payload, TimeInSeconds, TokenManager } from "@/usecases/ports";

export class FakeTokenManager implements TokenManager {
    private data: any

    async sign(info: any, expiresIn?: TimeInSeconds): Promise<JsonWebToken> {
        this.data = info
        return JSON.stringify(info) + 'TOKEN'
    }

    async verify(token: JsonWebToken): Promise<Either<Error, Payload>> {
        if (token.endsWith('TOKEN')) {
            return right({
                data: this.data,
                exp: 1000,
                iat: 300,
             })
        }

        return left(new Error('Invalid token.'))
    }

}