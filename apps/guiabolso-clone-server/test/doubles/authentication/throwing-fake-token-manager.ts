import { Either } from "@/shared"
import { Payload, PayloadRequest, PayloadResponse, TokenManager } from "@/usecases/authentication/ports"

export class ThrowingFakeTokenManager implements TokenManager {
    async sign (info: PayloadRequest, expiresIn?: number): Promise<string> {
      return 'a token'
    }

    async verify (token: string): Promise<Either<Error, PayloadResponse>> {
      throw new Error('An error.')
    }
}