import { InvalidAmountError, InvalidTransactionError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { Amount, Category } from "@/entities"

export type TransactionType = 'EXPENSE' | 'INCOME'

export class Transaction {
    public readonly category: Category
    public readonly amount: Amount
    public readonly description: string
    public readonly descriptionOriginal: string
    public readonly date: Date
    public readonly type: TransactionType
    public readonly comment: string
    public readonly ignored: boolean

    private constructor(transaction: { category: Category, amount: Amount, description?: string, descriptionOriginal?: string, date: Date, type: TransactionType, comment?: string, ignored?: boolean }) {
        this.amount = transaction.amount
        this.category = transaction.category ?? null
        this.description = transaction.description ?? ''
        this.descriptionOriginal = transaction.descriptionOriginal ?? ''
        this.date = transaction.date
        this.type = transaction.type
        this.comment = transaction.comment ?? ''
        this.ignored = !!transaction.ignored
    }

    public static create(transaction: { category?: Category, amount: number, description?: string, descriptionOriginal?: string, date: Date, type: string, comment?: string, ignored?: boolean }): Either<InvalidTransactionError | InvalidAmountError, Transaction> {

        if(!transaction.description && !transaction.descriptionOriginal) {
            return left(new InvalidTransactionError('Required some description'))
        }

        if(transaction.amount === 0) {
            return left(new InvalidTransactionError('Invalid amount'))
        }

        if(transaction.type === 'EXPENSE' && transaction.amount > 0) {
            return left(new InvalidTransactionError('An expense should have a negative amount'))
        }
        
        if(transaction.type === 'INCOME' && transaction.amount < 0) {
            return left(new InvalidTransactionError('An income should have a positive amount'))
        }

        const amountOrError = Amount.create(transaction.amount)

        if(amountOrError.isLeft()) {
            return left(amountOrError.value)
        }

        const amount = amountOrError.value as Amount

        return right(new Transaction({ 
            amount, 
            category: transaction.category,
            description: transaction.description,
            descriptionOriginal: transaction.descriptionOriginal,
            date: transaction.date,
            type: transaction.type as TransactionType,
            comment: transaction.comment,
            ignored: transaction.ignored,
        }))
    }
}