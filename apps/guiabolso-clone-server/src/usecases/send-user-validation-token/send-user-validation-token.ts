import { Either, left, right } from "@/shared";
import { MailService, Payload, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors";
import { EmailValidationPayloadData } from "@/usecases/send-user-validation-token/ports"

export class SendUserValidationToken implements UseCase {
    private readonly userRepo: UserRepository
    private readonly tokenManager: TokenManager
    private readonly mailService: MailService

    constructor(userRepository: UserRepository, tokenManager: TokenManager, mailService: MailService) {
        this.userRepo = userRepository
        this.tokenManager = tokenManager
        this.mailService = mailService
    }

    async perform(userId: string): Promise<Either<UnregisteredUserError | InvalidUserError, void>> {
        const userData = await this.userRepo.findUserById(userId)

        if(!userData) {
            return left(new UnregisteredUserError('usuário não encontrado'))
        }
        
        if(userData.isVerified) {
            return left(new InvalidUserError('Usuário já verificado'))
        }

        const payload: EmailValidationPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await this.tokenManager.sign(payload, sixHours)
        
        const payloadResponse = (await this.tokenManager.verify(emailValidationToken)).value as Payload
        
        this.mailService.send(`Olá ${userData.name},\nConfirme seu e-mail para concluir seu cadastro. Acesse o link: www.site/t=${emailValidationToken}`, "[Guiabolso Clone] Valide seu email", userData.email)
        

    }

}