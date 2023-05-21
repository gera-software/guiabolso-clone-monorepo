import { Either, left, right } from "@/shared";
import { PayloadData, Payload, TokenManager, TimeInSeconds, JsonWebToken } from "@/usecases/authentication/ports";

export class FakeTokenManager implements TokenManager {

    async sign(info: PayloadData, expiresIn?: TimeInSeconds): Promise<JsonWebToken> {
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