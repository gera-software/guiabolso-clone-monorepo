import { Encoder, UseCase, UserData, UserRepository } from "@/usecases/ports"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { User } from "@/entities"
import { ExistingUserError } from "./errors"

/**
 * Cadastro de novo usuário
 */
export class SignUp implements UseCase {
    private readonly userRepository: UserRepository
    private readonly encoder: Encoder
    private readonly sendUserValidationToken: UseCase

    constructor(userRepository: UserRepository, encoder: Encoder, sendUserValidationToken: UseCase) {
        this.userRepository = userRepository
        this.encoder = encoder
        this.sendUserValidationToken = sendUserValidationToken
    }

    public async perform(request: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | ExistingUserError, UserData>> {
        const userOrError = User.create(request)

        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const found = await this.userRepository.findUserByEmail(request.email)
        if(found) {
            return left(new ExistingUserError())
        }

        const newUser: User = userOrError.value as User

        const encodedPassword = await this.encoder.encode(newUser.password.value)
        const createdUser = await this.userRepository.add({
            name: newUser.name,
            email: newUser.email.value,
            password: encodedPassword,
            isVerified: false,
        })

        delete createdUser.password

        await this.sendUserValidationToken.perform(createdUser.id)

        return right(createdUser)
    }
}