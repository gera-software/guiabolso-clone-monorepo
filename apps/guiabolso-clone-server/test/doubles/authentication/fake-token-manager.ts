import { Either, left, right } from "@/shared";
import { Payload, PayloadRequest, PayloadResponse, TokenManager } from "@/usecases/authentication/ports";

export class FakeTokenManager implements TokenManager {

    async sign(info: PayloadRequest, expiresIn?: number): Promise<string> {
        return info.id + 'TOKEN'
    }

    async verify(token: string): Promise<Either<Error, PayloadResponse>> {
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