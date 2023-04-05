import { CreateManualAccount } from "@/usecases/create-manual-account"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { CreateManualCreditCardAccount } from "@/usecases/create-manual-credit-card-account"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { CreateManualAccountController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeUserRepository, makeAccountRepository, makeInstitutionRepository } from "@/main/factories"

export const makeCreateManualAccountController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const institutionRepository = makeInstitutionRepository()
    const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
    const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
    const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
    const usecase = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)

    const controller = new CreateManualAccountController(usecase)

    return controller
}