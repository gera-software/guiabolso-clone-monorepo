import { left, right } from "@/shared";
import { InMemoryUserRepository } from "@test/doubles/repositories";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { SignInData } from "./ports";
import { Encoder } from "../ports";

export class CustomAuthentication {
    private readonly userRepository: InMemoryUserRepository
    private readonly encoder: Encoder

    constructor(userRepository: InMemoryUserRepository, encoder: Encoder) {
        this.userRepository = userRepository
        this.encoder = encoder
    }

    public async auth(request: SignInData) {

        const userFound = await this.userRepository.findByEmail(request.email)

        if(!userFound) {
            return left(new UserNotFoundError())
        }

        const matches = await this.encoder.compare(request.password, userFound.password)
        if(matches) {
            return right(userFound)
        }

        return left(new WrongPasswordError())
    }
}