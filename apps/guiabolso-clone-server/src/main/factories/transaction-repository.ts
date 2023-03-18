import { MongodbTransactionRepository } from "@/external/repositories/mongodb"
import { TransactionRepository } from "@/usecases/ports"

export const makeTransactionRepository = (): TransactionRepository => {
    return new MongodbTransactionRepository()
}