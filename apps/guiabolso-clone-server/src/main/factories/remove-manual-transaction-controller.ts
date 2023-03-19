import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction";
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet";
import { RemoveManualTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories";
import { RemoveManualTransactionFromBank } from "@/usecases/remove-manual-transaction-from-bank";

export const makeRemoveManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const transactionRepository = makeTransactionRepository()
    const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
    const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
    
    const usecase = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank)

    const controller = new RemoveManualTransactionController(usecase)
    return controller
}