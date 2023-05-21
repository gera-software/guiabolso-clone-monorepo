import { Either, right } from "@/shared";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { AuthenticationParams, AuthenticationResult, AuthenticationService } from "@/usecases/authentication/ports";

export class AuthenticationServiceStub implements AuthenticationService {
    async auth (authenticationParams: AuthenticationParams): Promise<Either<UserNotFoundError | WrongPasswordError, AuthenticationResult>> {
      return right({
        data: {
          id: 'valid_id',
          name: 'valid name',
          email: 'valid@email.com'
        },
        iat: 300,
        exp: 500,
        accessToken: 'valid_access_token',
      })
    }
}