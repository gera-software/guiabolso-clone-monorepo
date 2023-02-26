import { Either, right } from "@/shared";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { AuthenticationParams, AuthenticationResult, AuthenticationService } from "@/usecases/authentication/ports";

export class AuthenticationServiceStub implements AuthenticationService {
    async auth (authenticationParams: AuthenticationParams): Promise<Either<UserNotFoundError | WrongPasswordError, AuthenticationResult>> {
      return right({
        accessToken: 'accessToken',
        id: '6057e9885c94f99b6dc1410a'
      })
    }
}