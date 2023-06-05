import { Either } from "@/shared"
import { UserPayloadData } from "@/usecases/authentication/ports"
import { JsonWebToken, Payload, TimeInSeconds, TokenManager } from "@/usecases/ports/token-manager"

export class ThrowingFakeTokenManager implements TokenManager {
    async sign (info: UserPayloadData, expiresIn?: TimeInSeconds): Promise<JsonWebToken> {
      return 'a token'
    }

    async verify (token: JsonWebToken): Promise<Either<Error, Payload>> {
      throw new Error('An error.')
    }
}