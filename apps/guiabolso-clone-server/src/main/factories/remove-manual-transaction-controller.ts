import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction";
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet";
import { RemoveManualTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories";

export const makeRemoveManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const transactionRepository = makeTransactionRepository()
    const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
    
    const usecase = new RemoveManualTransaction(removeManualTransactionFromWallet)

    const controller = new RemoveManualTransactionController(usecase)
    return controller
}