import { Controller } from "@/web-controllers/ports";
import { makeTokenManager, makeUserRepository } from "@/main/factories";
import { CheckUserValidationToken } from "@/usecases/check-user-validation-token";
import { CheckUserValidationTokenController } from "@/web-controllers";

export const makeCheckUserValidationTokenController = (): Controller => {
    const userRepository = makeUserRepository()
    const fakeTokenManager = makeTokenManager()
    const usecase = new CheckUserValidationToken(userRepository, fakeTokenManager)
    const controller = new CheckUserValidationTokenController(usecase) 

    return controller
}