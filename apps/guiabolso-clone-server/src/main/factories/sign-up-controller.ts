import { SignUp } from "@/usecases/sign-up"
import { SignUpController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeEncoder, makeMailService, makeTokenManager, makeUserRepository } from "@/main/factories"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"

export const makeSignUpController = (): Controller => {
    const userRepository = makeUserRepository()
    const encoder = makeEncoder()
    const tokenManager = makeTokenManager()
    const mailService = makeMailService()
    const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, tokenManager, mailService, process.env.FRONTEND_URL)
    const usecase = new SignUp(userRepository, encoder, sendUserValidationTokenUsecase)
    const controller = new SignUpController(usecase)
    return controller
}