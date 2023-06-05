import { left, right } from "@/shared";
import { TokenRepository, UseCase, UserRepository } from "@/usecases/ports";
import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors";
import { Token } from "@/entities";
import crypto from "crypto";

export class SendUserValidationToken implements UseCase {
    private readonly userRepo: UserRepository
    private readonly tokenRepo: TokenRepository

    constructor(userRepository: UserRepository, tokenRepository: TokenRepository) {
        this.userRepo = userRepository
        this.tokenRepo = tokenRepository
    }

    async perform(userId: string): Promise<any> {
        const userData = await this.userRepo.findUserById(userId)

        if(!userData) {
            return left(new UnregisteredUserError('usuário não encontrado'))
        }
        
        if(userData.isVerified) {
            return left(new InvalidUserError('Usuário já verificado'))
        }

        const randomString = crypto.createHash('sha256').digest('hex')
        // const expireDate = new Date(new Date().setHours(new Date().getHours() + 6))
        const expireDate = new Date()
        const tokenOrError = Token.create('USER-VALIDATION-TOKEN', userId, randomString, expireDate)
        // if(tokenOrError.isLeft()) {
        //     return left(tokenOrError.value)
        // }

        const token = tokenOrError.value as Token

        const tokenData = {
            type: token.type,
            userId: token.userId,
            hash: token.hash,
            expireAt: token.expireAt
        }

        const result = await this.tokenRepo.update(tokenData)
        return right(result)

    }

}