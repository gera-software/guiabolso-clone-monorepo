import { AddManualTransaction } from "@/usecases/add-manual-transaction";
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet";
import { AddManualTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeCategoryRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories";

export const makeAddManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const categoryRepository = makeCategoryRepository()
    const transactionRepository = makeTransactionRepository()
    const addManualTransactionToWallet = new AddManualTransactionToWallet(userRepository, accountRepository, transactionRepository, categoryRepository)
    
    const usecase = new AddManualTransaction(addManualTransactionToWallet)
    const controller = new AddManualTransactionController(usecase)
    return controller
}