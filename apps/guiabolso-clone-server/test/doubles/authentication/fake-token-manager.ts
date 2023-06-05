import { Either, left, right } from "@/shared";
import { JsonWebToken, Payload, TimeInSeconds, TokenManager } from "@/usecases/ports";

export class FakeTokenManager implements TokenManager {

    async sign(info: any, expiresIn?: TimeInSeconds): Promise<JsonWebToken> {
        return info.id + 'TOKEN'
    }

    async verify(token: JsonWebToken): Promise<Either<Error, Payload>> {
        if (token.endsWith('TOKEN')) {
            return right({
                data: {
                    id: token.substring(0, token.indexOf('TOKEN')),
                    name: 'fake name',
                    email: 'fake@mail.com'
                },
                exp: 1000,
                iat: 300,
             })
        }

        return left(new Error('Invalid token.'))
    }

}