import { UpdateManualTransaction } from "@/usecases/update-manual-transaction"
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet"
import { UpdateManualTransactionController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeAccountRepository, makeCategoryRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories"

export const makeUpdateManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const transactionRepository = makeTransactionRepository()
    const categoryRepository = makeCategoryRepository()
    const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, categoryRepository, accountRepository, userRepository)

    const usecase = new UpdateManualTransaction(updateManualTransactionFromWallet)

    const controller = new UpdateManualTransactionController(usecase)
    return controller
}