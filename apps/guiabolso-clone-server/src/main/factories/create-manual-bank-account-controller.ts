import { CreateManualBankAccountController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeAccountRepository, makeInstitutionRepository, makeUserRepository } from "@/main/factories"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"

export const makeCreateManualBankAccountController = (): Controller => {
    const accountRepository = makeAccountRepository()
    const userRepository = makeUserRepository()
    const institutioRepository = makeInstitutionRepository()
    const usecase = new CreateManualBankAccount(accountRepository, userRepository, institutioRepository)
    const controller = new CreateManualBankAccountController(usecase)
    return controller
}