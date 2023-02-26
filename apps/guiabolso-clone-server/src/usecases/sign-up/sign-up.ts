import { InMemoryUserRepository } from "@test/doubles"
import { UserData } from "@/usecases/ports"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { User } from "@/entities"
import { ExistingUserError } from "./errors"

/**
 * Cadstro de novo usuário
 */
export class SignUp {
    private readonly userRepository: InMemoryUserRepository

    constructor(userRepository: InMemoryUserRepository) {
        this.userRepository = userRepository
    }

    public async perform(request: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | ExistingUserError, UserData>> {
        const userOrError = User.create(request)

        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = await this.userRepository.findByEmail(request.email)
        if(user) {
            return left(new ExistingUserError())
        }

        await this.userRepository.add(request)

        return right(request)

    }
}