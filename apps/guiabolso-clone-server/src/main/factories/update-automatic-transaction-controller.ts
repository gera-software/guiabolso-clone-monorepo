import { UpdateAutomaticTransaction } from "@/usecases/update-automatic-transaction";
import { UpdateAutomaticTransactionController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeCategoryRepository, makeTransactionRepository, makeUserRepository } from "@/main/factories"

export const makeUpdateAutomaticTransactionController = (): Controller => {
    const userRepository = makeUserRepository()
    const accountRepository = makeAccountRepository()
    const transactionRepository = makeTransactionRepository()
    const categoryRepository = makeCategoryRepository()

    const usecase = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository) 
    const controller = new UpdateAutomaticTransactionController(usecase)

    return controller
}