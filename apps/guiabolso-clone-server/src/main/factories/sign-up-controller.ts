import { CustomAuthentication } from "@/usecases/authentication"
import { SignUp } from "@/usecases/sign-up"
import { SignUpController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeEncoder, makeTokenManager, makeUserRepository } from "@/main/factories"

export const makeSignUpController = (): Controller => {
    const userRepository = makeUserRepository()
    const encoder = makeEncoder()
    const tokenManager = makeTokenManager()
    const authenticationService = new CustomAuthentication(userRepository, encoder, tokenManager)
    const usecase = new SignUp(userRepository, encoder, authenticationService)
    const controller = new SignUpController(usecase)
    return controller
}