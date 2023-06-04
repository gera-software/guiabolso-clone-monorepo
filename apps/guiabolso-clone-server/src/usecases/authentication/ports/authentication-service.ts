import { Either } from "@/shared"
import { UserNotFoundError, UserNotVerifiedError, WrongPasswordError } from "@/usecases/authentication/errors"

export type AuthenticationParams = {
    email: string
    password: string
}

export type AuthenticationResult = {
    data: {
        id: string,
        name: string,
        email: string,
    },
    iat: number,
    exp: number,
    accessToken: string,
}


export interface AuthenticationService {
    auth: (authenticationParams: AuthenticationParams) =>
      Promise<Either<UserNotVerifiedError | UserNotFoundError | WrongPasswordError, AuthenticationResult>>
}