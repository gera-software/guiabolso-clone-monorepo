import { AddManualTransaction } from "@/usecases/add-manual-transaction";
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet";
import { AddManualTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { 
    makeAccountRepository, 
    makeCategoryRepository, 
    makeCreditCardInvoiceRepository, 
    makeTransactionRepository, 
    makeUserRepository 
} from "@/main/factories";
import { AddManualTransactionToBank } from "@/usecases/add-manual-transaction-to-bank";
import { AddManualTransactionToCreditCard } from "@/usecases/add-manual-transaction-to-credit-card";

export const makeAddManualTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const categoryRepository = makeCategoryRepository()
    const transactionRepository = makeTransactionRepository()
    const invoiceRepository = makeCreditCardInvoiceRepository()
    const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
    const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
    const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
    
    const usecase = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
    const controller = new AddManualTransactionController(usecase)
    return controller
}