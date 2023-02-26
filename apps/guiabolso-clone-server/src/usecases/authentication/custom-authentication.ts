import { Either, left, right } from "@/shared";
import { InMemoryUserRepository } from "@test/doubles/repositories";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { AuthenticationParams, AuthenticationResult, TokenManager } from "@/usecases/authentication/ports";
import { Encoder } from "@/usecases/ports";
import { AuthenticationService } from "@/usecases/authentication/ports";

export class CustomAuthentication implements AuthenticationService {
    private readonly userRepository: InMemoryUserRepository
    private readonly encoder: Encoder
    private readonly tokenManager: TokenManager

    constructor(userRepository: InMemoryUserRepository, encoder: Encoder, tokenManager: TokenManager) {
        this.userRepository = userRepository
        this.encoder = encoder
        this.tokenManager = tokenManager
    }

    public async auth(request: AuthenticationParams): Promise<Either<UserNotFoundError | WrongPasswordError, AuthenticationResult>>{

        const userFound = await this.userRepository.findByEmail(request.email)

        if(!userFound) {
            return left(new UserNotFoundError())
        }

        const matches = await this.encoder.compare(request.password, userFound.password)
        if(matches) {
            const accessToken = await this.tokenManager.sign({ id: userFound.id ?? ''})
            return right({
                id: userFound.id ?? '',
                accessToken,
            })
        }

        return left(new WrongPasswordError())
    }
}