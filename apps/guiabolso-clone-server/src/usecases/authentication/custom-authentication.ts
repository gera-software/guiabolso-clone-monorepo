import { left } from "@/shared";
import { InMemoryUserRepository } from "@test/doubles/repositories";
import { WrongPasswordError } from "@/usecases/authentication/errors";
import { SignInData } from "./ports";

export class CustomAuthentication {
    private readonly userRepository: InMemoryUserRepository

    constructor(userRepository: InMemoryUserRepository) {
        this.userRepository = userRepository
    }

    public async auth(request: SignInData) {
        return left(new WrongPasswordError())
    }
}