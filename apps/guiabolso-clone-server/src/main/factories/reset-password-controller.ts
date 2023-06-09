import { Controller } from "@/web-controllers/ports";
import { makeUserRepository, makeEncoder, makeMailService, makeTokenManager } from "@/main/factories";
import { ResetPassword } from "@/usecases/reset-password";
import { ResetPasswordController } from "@/web-controllers";

export const makeResetPasswordController = (): Controller => {
    const userRepository = makeUserRepository()
    const tokenManager = makeTokenManager()
    const mailService = makeMailService()
    const encoder = makeEncoder()
    const usecase = new ResetPassword(userRepository, tokenManager, mailService, encoder, process.env.FRONTEND_URL)
    const controller = new ResetPasswordController(usecase) 

    return controller
}