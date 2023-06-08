import { MailService, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { right } from "@/shared";
import { ResetPasswordPayloadData } from "@/usecases/send-reset-password-token/ports";

export class SendResetPasswordToken implements UseCase {
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
    
    async perform(email: string): Promise<any> {
        const userData = await this.userRepo.findUserByEmail(email)

        if(!userData) {
            // return left(new UnregisteredUserError('usuário não encontrado'))
            return right(null)
        }

        const payload: ResetPasswordPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await this.tokenManager.sign(payload, sixHours)

        const url = `${this.FRONTEND_URL}/reset-password?t=${resetPasswordToken}`
        const textMessage = `Olá ${userData.name},\nAcesse o link para resetar sua senha: ${url}`
        const htmlMessage = `
            <p>Olá ${userData.name},</p>
            <p>Acesse o link para resetar sua senha: <a href="${url}">Resetar senha</a></p>`
        this.mailService.send(textMessage, htmlMessage, "[Guiabolso Clone] Solicitação de alteração de senha", userData.email)
        
        return right(null)
    }

}