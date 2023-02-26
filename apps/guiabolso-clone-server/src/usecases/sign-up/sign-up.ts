import { InMemoryUserRepository } from "@test/doubles"
import { UserData } from "@/usecases/ports"
import { InvalidEmailError } from "@/entities/errors"
import { Either, left } from "@/shared"

export class SignUp {
    constructor(userRepository: InMemoryUserRepository) {

    }

    public async perform(request: UserData): Promise<Either<InvalidEmailError, UserData>> {
        return left(new InvalidEmailError())
    }
}