import { left, right } from "@/shared";
import { InMemoryUserRepository } from "@test/doubles/repositories";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { SignInData, TokenManager } from "./ports";
import { Encoder } from "../ports";

export class CustomAuthentication {
    private readonly userRepository: InMemoryUserRepository
    private readonly encoder: Encoder
    private readonly tokenManager: TokenManager
    
    constructor(userRepository: InMemoryUserRepository, encoder: Encoder, tokenManager: TokenManager) {
        this.userRepository = userRepository
        this.encoder = encoder
        this.tokenManager = tokenManager
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