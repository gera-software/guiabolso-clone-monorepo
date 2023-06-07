import { Either, left } from "@/shared";
import { MailService, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors";
import { EmailValidationPayloadData } from "@/usecases/send-user-validation-token/ports"

export class SendUserValidationToken implements UseCase {
    private readonly userRepo: UserRepository
    private readonly tokenManager: TokenManager
    private readonly mailService: MailService
    private readonly FRONTEND_URL: string

    constructor(userRepository: UserRepository, tokenManager: TokenManager, mailService: MailService, frontendUrl: string) {
        this.userRepo = userRepository
        this.tokenManager = tokenManager
        this.mailService = mailService
        this.FRONTEND_URL = frontendUrl
    }

    // TODO should receive an UserData, no need to search on userRepo
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
        
        const url = `${this.FRONTEND_URL}/email-validation?t=${emailValidationToken}`

        const textMessage = `Olá ${userData.name},\nConfirme seu e-mail para concluir seu cadastro. Acesse o link: ${url}`
        const htmlMessage = `
            <p>Olá ${userData.name},</p>
            <p>Confirme seu e-mail para concluir seu cadastro.</p> 
            <p>Acesse o link: <a href="${url}">Confirmar e-mail</a></p>`
        this.mailService.send(textMessage, htmlMessage, "[Guiabolso Clone] Valide seu email", userData.email)
    }

}