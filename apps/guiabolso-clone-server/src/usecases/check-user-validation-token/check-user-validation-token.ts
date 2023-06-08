import { left, right } from "@/shared";
import { MailService, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { InvalidTokenError } from "@/usecases/errors";
import { EmailValidationPayloadData } from "@/usecases/send-user-validation-token/ports";

export class CheckUserValidationToken implements UseCase {
    private readonly userRepo: UserRepository
    private readonly tokenManager: TokenManager
    private readonly mailService: MailService

    constructor(userRepository: UserRepository, tokenManager: TokenManager, mailService: MailService) {
        this.userRepo = userRepository
        this.tokenManager = tokenManager
        this.mailService = mailService
    }


    async perform(token: string): Promise<any> {

        const tokenOrError = await this.tokenManager.verify(token)

        if(tokenOrError.isLeft()) {
            return left(new InvalidTokenError(tokenOrError.value.message))
        }

        const payloadData = tokenOrError.value.data as EmailValidationPayloadData

        const userData = await this.userRepo.findUserById(payloadData.id)

        if(!userData) {
            return left(new InvalidTokenError('usuário inválido'))
        }

        if(userData.isVerified) {
            return left(new InvalidTokenError('Usuário já está validado'))
        }

        if(userData.email != payloadData.email) {
            return left(new InvalidTokenError('email inválido'))
        }

        // TODO save
        // this.userRepo.

        // TODO send mail
        
        return right(null)
    }

}