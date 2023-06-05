import { left, right } from "@/shared";
import { Payload, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors";

import { UserPayloadData } from "@/usecases/authentication/ports";
import { EmailValidationPayloadData } from "./ports";

export class SendUserValidationToken implements UseCase {
    private readonly userRepo: UserRepository
    private readonly tokenManager: TokenManager

    constructor(userRepository: UserRepository, tokenManager: TokenManager) {
        this.userRepo = userRepository
        this.tokenManager = tokenManager
    }

    async perform(userId: string): Promise<any> {
        const userData = await this.userRepo.findUserById(userId)

        if(!userData) {
            return left(new UnregisteredUserError('usuário não encontrado'))
        }
        
        if(userData.isVerified) {
            return left(new InvalidUserError('Usuário já verificado'))
        }

        const payload: EmailValidationPayloadData = {
            id: 'id',
            email: 'email',
        }
        const accessToken = await this.tokenManager.sign(payload)
        
        const payloadResponse = (await this.tokenManager.verify(accessToken)).value as Payload
        return right({
            ...payloadResponse,
            accessToken,
        })

        // const randomString = crypto.createHash('sha256').digest('hex')
        // // const expireDate = new Date(new Date().setHours(new Date().getHours() + 6))
        // const expireDate = new Date()
        // const tokenOrError = Token.create('USER-VALIDATION-TOKEN', userId, randomString, expireDate)
        // // if(tokenOrError.isLeft()) {
        // //     return left(tokenOrError.value)
        // // }

        // const token = tokenOrError.value as Token

        // const tokenData = {
        //     type: token.type,
        //     userId: token.userId,
        //     hash: token.hash,
        //     expireAt: token.expireAt
        // }

        // const result = await this.tokenRepo.update(tokenData)
        // return right(result)

    }

}