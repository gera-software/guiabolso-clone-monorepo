import { Account, Transaction } from "@/entities"

export interface ManualAccount extends Account {
    addTransaction(transaction: Transaction): void
    removeTransaction(transaction: Transaction): void
}