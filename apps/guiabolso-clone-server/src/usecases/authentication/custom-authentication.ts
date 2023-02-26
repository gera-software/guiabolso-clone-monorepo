import { left } from "@/shared";
import { InMemoryUserRepository } from "@test/doubles/repositories";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { SignInData } from "./ports";

export class CustomAuthentication {
    private readonly userRepository: InMemoryUserRepository

    constructor(userRepository: InMemoryUserRepository) {
        this.userRepository = userRepository
    }

    public async auth(request: SignInData) {

        const found = await this.userRepository.findByEmail(request.email)

        if(!found) {
            return left(new UserNotFoundError())
        }

        return left(new WrongPasswordError())
    }
}