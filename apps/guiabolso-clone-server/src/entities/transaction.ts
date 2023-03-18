import { Amount, Category } from "@/entities"

export type TransactionType = 'EXPENSE' | 'INCOME'

export interface Transaction {
    category: Category
    amount: Amount
    description: string
    date: Date
    comment: string
    ignored: boolean
    type: TransactionType
}