import { Either } from "@/shared"
import { PayloadRequest, PayloadResponse, TokenManager, TimeInSeconds } from "@/usecases/authentication/ports"

export class ThrowingFakeTokenManager implements TokenManager {
    async sign (info: PayloadRequest, expiresIn?: TimeInSeconds): Promise<string> {
      return 'a token'
    }

    async verify (token: string): Promise<Either<Error, PayloadResponse>> {
      throw new Error('An error.')
    }
}