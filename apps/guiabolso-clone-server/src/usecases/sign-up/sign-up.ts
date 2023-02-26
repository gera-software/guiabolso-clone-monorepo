import { InMemoryUserRepository } from "@test/doubles"
import { UserData } from "@/usecases/ports"

export class SignUp {
    constructor(userRepository: InMemoryUserRepository) {

    }

    public async perform(request: UserData) {

    }
}