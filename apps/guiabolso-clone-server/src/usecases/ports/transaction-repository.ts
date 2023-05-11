import { TransactionData } from "@/usecases/ports"
import { BulkWriteResult } from "mongodb"

export interface TransactionRepository {
    add(transaction: TransactionData): Promise<TransactionData>
    findById(id: string): Promise<TransactionData>
    exists(id: string): Promise<boolean>
    remove(id: string): Promise<TransactionData>
    update(transaction: TransactionData): Promise<TransactionData>
    mergeTransactions(transactions: TransactionData[]): Promise<BulkWriteResult>
}