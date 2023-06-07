import { CustomAuthentication } from "@/usecases/authentication"
import { SignIn } from "@/usecases/sign-in"
import { Controller } from "@/web-controllers/ports"
import { SignInController } from "@/web-controllers/sign-in-controller"
import { makeEncoder, makeMailService, makeTokenManager, makeUserRepository } from "@/main/factories"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"

export const makeSignInController = (): Controller => {
    const userRepository = makeUserRepository()
    const encoder = makeEncoder()
    const tokenManager = makeTokenManager()
    const mailService = makeMailService()
    const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, tokenManager, mailService, process.env.FRONTEND_URL)
    const authenticationService = new CustomAuthentication(userRepository, encoder, tokenManager, sendUserValidationTokenUsecase)
    const usecase = new SignIn(authenticationService)
    const controller = new SignInController(usecase)
    return controller
  }