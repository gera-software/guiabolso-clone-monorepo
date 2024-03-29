import { Either, left, right } from "@/shared";
import { UserNotFoundError, UserNotVerifiedError, WrongPasswordError } from "@/usecases/authentication/errors";
import { AuthenticationParams, AuthenticationResult, UserPayloadData } from "@/usecases/authentication/ports";
import { Encoder, Payload, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { AuthenticationService } from "@/usecases/authentication/ports";

export class CustomAuthentication implements AuthenticationService {
    private readonly userRepository: UserRepository
    private readonly encoder: Encoder
    private readonly tokenManager: TokenManager
    private readonly sendUserValidationToken: UseCase

    constructor(userRepository: UserRepository, encoder: Encoder, tokenManager: TokenManager, sendUserValidationToken: UseCase) {
        this.userRepository = userRepository
        this.encoder = encoder
        this.tokenManager = tokenManager
        this.sendUserValidationToken = sendUserValidationToken
    }

    public async auth(request: AuthenticationParams): Promise<Either<UserNotVerifiedError | UserNotFoundError | WrongPasswordError, AuthenticationResult>>{

        const userFound = await this.userRepository.findUserByEmail(request.email)

        if(!userFound) {
            return left(new UserNotFoundError("E-mail ou senha incorretos"))
        }

        const matches = await this.encoder.compare(request.password, userFound.password)
        if(matches) {

            if(!userFound.isVerified) {
                await this.sendUserValidationToken.perform(userFound.id)
                return left(new UserNotVerifiedError('Por favor, verifique seu e-mail. Nós enviamos um link para ativação da sua conta.'))
            }

            const payload: UserPayloadData = {
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