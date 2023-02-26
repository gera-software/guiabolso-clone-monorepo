import { Either, left, right } from "@/shared";
import { Payload, TokenManager } from "@/usecases/authentication/ports";

export class FakeTokenManager implements TokenManager {

    async sign(info: Payload): Promise<string> {
        return info.id + 'TOKEN'
    }
    async verify(token: string): Promise<Either<Error, Payload>> {
        if (token.endsWith('TOKEN')) {
            return right({ id: token.substring(0, token.indexOf('TOKEN')) })
        }

        return left(new Error('Invalid token.'))
    }

}