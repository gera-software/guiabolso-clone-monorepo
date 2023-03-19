import { AddManualTransaction } from "@/usecases/add-manual-transaction";
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet";
import { AddManualTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeCategoryRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories";
import { AddManualTransactionToBank } from "@/usecases/add-manual-transaction-to-bank";

export const makeAddManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const categoryRepository = makeCategoryRepository()
    const transactionRepository = makeTransactionRepository()
    const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
    const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
    
    const usecase = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)
    const controller = new AddManualTransactionController(usecase)
    return controller
}