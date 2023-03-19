import { TransactionData } from "@/usecases/ports"
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports"

export type TransactionToUpdateData = {
    oldTransactionData: TransactionData, 
    newTransaction: TransactionToAddData,
}