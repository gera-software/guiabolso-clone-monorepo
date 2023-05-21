import { Either } from "@/shared"
import { PayloadData, Payload, TokenManager, TimeInSeconds, JsonWebToken } from "@/usecases/authentication/ports"

export class ThrowingFakeTokenManager implements TokenManager {
    async sign (info: PayloadData, expiresIn?: TimeInSeconds): Promise<JsonWebToken> {
      return 'a token'
    }

    async verify (token: JsonWebToken): Promise<Either<Error, Payload>> {
      throw new Error('An error.')
    }
}