import { UpdateManualTransaction } from "@/usecases/update-manual-transaction"
import { UpdateManualTransactionController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeAccountRepository, makeCategoryRepository, makeCreditCardInvoiceRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories"
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet"
import { UpdateManualTransactionFromBank } from "@/usecases/update-manual-transaction-from-bank"
import { UpdateManualTransactionFromCreditCard } from "@/usecases/update-manual-transaction-from-credit-card"

export const makeUpdateManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const transactionRepository = makeTransactionRepository()
    const categoryRepository = makeCategoryRepository()
    const invoiceRepository = makeCreditCardInvoiceRepository()
    const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
    const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
    const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

    const usecase = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)

    const controller = new UpdateManualTransactionController(usecase)
    return controller
}