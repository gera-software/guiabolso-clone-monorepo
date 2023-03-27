import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction";
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet";
import { RemoveManualTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeCreditCardInvoiceRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories";
import { RemoveManualTransactionFromBank } from "@/usecases/remove-manual-transaction-from-bank";
import { RemoveManualTransactionFromCreditCard } from "@/usecases/remove-manual-transaction-from-credit-card";

export const makeRemoveManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const transactionRepository = makeTransactionRepository()
    const invoiceRepository = makeCreditCardInvoiceRepository()
    const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
    const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
    const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
    
    const usecase = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)

    const controller = new RemoveManualTransactionController(usecase)
    return controller
}