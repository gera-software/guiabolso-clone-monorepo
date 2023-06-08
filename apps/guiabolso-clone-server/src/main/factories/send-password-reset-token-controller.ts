import { Controller } from "@/web-controllers/ports";
import { makeUserRepository } from "@/main/factories/user-repository";
import { makeTokenManager } from "@/main/factories/token-manager";
import { makeMailService } from "@/main/factories/mail-service";
import { SendPasswordResetToken } from "@/usecases/send-password-reset-token";
import { SendPasswordResetTokenController } from "@/web-controllers";

export const makeSendPasswordResetTokenController = (): Controller => {
    const userRepository = makeUserRepository()
    const tokenManager = makeTokenManager()
    const mailService = makeMailService()
    const usecase = new SendPasswordResetToken(userRepository, tokenManager, mailService, process.env.FRONTEND_URL)
    const controller = new SendPasswordResetTokenController(usecase)
    
    return controller
}