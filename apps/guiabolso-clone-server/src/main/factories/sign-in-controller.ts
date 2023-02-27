import { CustomAuthentication } from "@/usecases/authentication"
import { SignIn } from "@/usecases/sign-in"
import { Controller } from "@/web-controllers/ports"
import { SignInController } from "@/web-controllers/sign-in-controller"
import { makeEncoder, makeTokenManager, makeUserRepository } from "@/main/factories"

export const makeSignInController = (): Controller => {
    const userRepository = makeUserRepository()
    const encoder = makeEncoder()
    const tokenManager = makeTokenManager()
    const authenticationService = new CustomAuthentication(userRepository, encoder, tokenManager)
    const usecase = new SignIn(authenticationService)
    const controller = new SignInController(usecase)
    return controller
  }