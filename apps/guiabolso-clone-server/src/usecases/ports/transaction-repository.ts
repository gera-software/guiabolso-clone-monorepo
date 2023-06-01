import { TransactionData } from "@/usecases/ports"

export interface TransactionRepository {
    add(transaction: TransactionData): Promise<TransactionData>
    findById(id: string): Promise<TransactionData>
    exists(id: string): Promise<boolean>
    remove(id: string): Promise<TransactionData>
    updateManual(transaction: TransactionData): Promise<TransactionData>
    updateAutomatic(transaction: TransactionData): Promise<TransactionData>
    mergeTransactions(transactions: TransactionData[]): Promise<{ upsertedIds: string[], modifiedCount: number }>
    recalculateInvoicesAmount(invoicesIds: string[]): Promise<{ invoiceId: string, amount: number }[]>
}