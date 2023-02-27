import { Either } from "@/shared"
import { Payload, TokenManager } from "@/usecases/authentication/ports"

export class ThrowingFakeTokenManager implements TokenManager {
    async sign (info: Payload, expiresIn?: string): Promise<string> {
      return 'a token'
    }

    async verify (token: string): Promise<Either<Error, Payload>> {
      throw new Error('An error.')
    }
}