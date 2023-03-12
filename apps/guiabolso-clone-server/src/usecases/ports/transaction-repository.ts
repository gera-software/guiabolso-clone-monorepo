import { TransactionData } from "@/usecases/ports"

export interface TransactionRepository {
    add(transaction: TransactionData): Promise<TransactionData>
    findById(id: string): Promise<TransactionData>
    exists(id: string): Promise<boolean>
}