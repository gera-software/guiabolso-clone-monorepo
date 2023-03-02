import { CreateManualCreditCardAccountController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeAccountRepository, makeInstitutionRepository, makeUserRepository } from "@/main/factories"
import { CreateManualCreditCardAccount } from "@/usecases/create-manual-credit-card-account"

export const makeCreateManualCreditCardAccountController = (): Controller => {
    const accountRepository = makeAccountRepository()
    const userRepository = makeUserRepository()
    const institutioRepository = makeInstitutionRepository()
    const usecase = new CreateManualCreditCardAccount(accountRepository, userRepository, institutioRepository)
    const controller = new CreateManualCreditCardAccountController(usecase)
    return controller
}