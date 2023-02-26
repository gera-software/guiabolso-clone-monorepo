import { InMemoryUserRepository } from "@test/doubles/repositories"
import { Encoder, UseCase, UserData } from "@/usecases/ports"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { User } from "@/entities"
import { ExistingUserError } from "./errors"
import { AuthenticationParams, AuthenticationResult, AuthenticationService } from "@/usecases/authentication/ports"

/**
 * Cadastro de novo usuário
 */
export class SignUp implements UseCase {
    private readonly userRepository: InMemoryUserRepository
    private readonly encoder: Encoder
    private readonly authenticationService: AuthenticationService

    constructor(userRepository: InMemoryUserRepository, encoder: Encoder, authenticationService: AuthenticationService) {
        this.userRepository = userRepository
        this.encoder = encoder
        this.authenticationService = authenticationService
    }

    public async perform(request: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | ExistingUserError, AuthenticationResult>> {
        const userOrError = User.create(request)

        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const found = await this.userRepository.findByEmail(request.email)
        if(found) {
            return left(new ExistingUserError())
        }

        const newUser: User = userOrError.value as User

        const encodedPassword = await this.encoder.encode(newUser.password.value)
        await this.userRepository.add({
            name: newUser.name,
            email: newUser.email.value,
            password: encodedPassword,
        })

        const response = (await this.authenticationService.auth(request as AuthenticationParams)).value as AuthenticationResult

        return right(response)

    }
}