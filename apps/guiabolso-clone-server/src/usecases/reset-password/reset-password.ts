import { left, right } from "@/shared";
import { Encoder, MailService, TokenManager, UseCase, UserRepository } from "@/usecases/ports";
import { InvalidTokenError } from "@/usecases/errors";
import { ResetPasswordPayloadData } from "@/usecases/send-password-reset-token/ports";
import { Password } from "@/entities";

export class ResetPassword implements UseCase {
    private readonly userRepo: UserRepository
    private readonly tokenManager: TokenManager
    private readonly mailService: MailService
    private readonly encoder: Encoder
    private readonly FRONTEND_URL: string

    constructor(userRepository: UserRepository, tokenManager: TokenManager, mailService: MailService, encoder: Encoder, frontendUrl: string) {
        this.userRepo = userRepository
        this.tokenManager = tokenManager
        this.mailService = mailService
        this.encoder = encoder
        this.FRONTEND_URL = frontendUrl
    }
    
    async perform(request: { token: string, password: string }): Promise<any> {
        const tokenOrError = await this.tokenManager.verify(request.token)

        if(tokenOrError.isLeft()) {
            return left(new InvalidTokenError(tokenOrError.value.message))
        }

        const payloadData = tokenOrError.value.data as ResetPasswordPayloadData

        const userData = await this.userRepo.findUserById(payloadData.id)

        if(!userData) {
            return left(new InvalidTokenError('usuário inválido'))
        }

        if(userData.email != payloadData.email) {
            return left(new InvalidTokenError('email inválido'))
        }

        const passwordOrError = Password.create(request.password)

        if(passwordOrError.isLeft()) {
            return left(passwordOrError.value)
        }

        const password = passwordOrError.value as Password

        const encodedPassword = await this.encoder.encode(password.value)
        await this.userRepo.updatePassword(userData.id, encodedPassword)


        const url = `${this.FRONTEND_URL}`

        const textMessage = `Olá ${userData.name},\nSua senha foi alterada. Faça login: ${url}`
        const htmlMessage = `
        <p>Olá ${userData.name},</p>
        <p>Sua senha foi alterada.</p> 
        <p><a href="${url}">Faça login</a></p>`
        this.mailService.send(textMessage, htmlMessage, "[Guiabolso Clone] Senha alterada", userData.email)
        
        return right(null)
    }

}