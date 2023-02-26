import { InMemoryUserRepository } from "@test/doubles/repositories"
import { Encoder, UserData } from "@/usecases/ports"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { User } from "@/entities"
import { ExistingUserError } from "./errors"

/**
 * Cadastro de novo usuário
 */
export class SignUp {
    private readonly userRepository: InMemoryUserRepository
    private readonly encoder: Encoder

    constructor(userRepository: InMemoryUserRepository, encoder: Encoder) {
        this.userRepository = userRepository
        this.encoder = encoder
    }

    public async perform(request: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | ExistingUserError, UserData>> {
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

        return right(request)

    }
}