import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { CreateManualWalletAccountController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeAccountRepository, makeUserRepository } from "@/main/factories"

export const makeCreateManualWalletAccountController = (): Controller => {
    const accountRepository = makeAccountRepository()
    const userRepository = makeUserRepository()
    const usecase = new CreateManualWalletAccount(accountRepository, userRepository)
    const controller = new CreateManualWalletAccountController(usecase)
    return controller
}