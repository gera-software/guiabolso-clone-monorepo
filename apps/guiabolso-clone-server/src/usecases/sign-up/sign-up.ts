import { InMemoryUserRepository } from "@test/doubles"
import { UserData } from "@/usecases/ports"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { User } from "@/entities"

export class SignUp {
    constructor(userRepository: InMemoryUserRepository) {

    }

    public async perform(request: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError, UserData>> {
        const userOrError = User.create(request)

        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        return right(request)
    }
}