import { Either, left, right } from "@/shared";
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors";
import { AuthenticationParams, AuthenticationResult, PayloadData, Payload, TokenManager } from "@/usecases/authentication/ports";
import { Encoder, UserRepository } from "@/usecases/ports";
import { AuthenticationService } from "@/usecases/authentication/ports";

export class CustomAuthentication implements AuthenticationService {
    private readonly userRepository: UserRepository
    private readonly encoder: Encoder
    private readonly tokenManager: TokenManager

    constructor(userRepository: UserRepository, encoder: Encoder, tokenManager: TokenManager) {
        this.userRepository = userRepository
        this.encoder = encoder
        this.tokenManager = tokenManager
    }

    public async auth(request: AuthenticationParams): Promise<Either<UserNotFoundError | WrongPasswordError, AuthenticationResult>>{

        const userFound = await this.userRepository.findUserByEmail(request.email)

        if(!userFound) {
            return left(new UserNotFoundError("E-mail ou senha incorretos"))
        }

        const matches = await this.encoder.compare(request.password, userFound.password)
        if(matches) {
            const payload: PayloadData = {
                id: userFound.id,
                name: userFound.name,
                email: userFound.email,
            }
            const accessToken = await this.tokenManager.sign(payload)
            
            const payloadResponse = (await this.tokenManager.verify(accessToken)).value as Payload
            return right({
                ...payloadResponse,
                accessToken,
            })
        }

        return left(new WrongPasswordError("E-mail ou senha incorretos"))
    }
}