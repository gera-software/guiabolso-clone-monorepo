import { InvalidAmountError, InvalidTransactionError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { Amount, Category, TransactionType } from "@/entities"

export class WalletTransaction {
    public readonly category: Category
    public readonly amount: Amount
    public readonly description: string
    public readonly date: Date
    public readonly comment: string
    public readonly ignored: boolean
    public readonly type: TransactionType

    private constructor(transaction: { category: Category, amount: Amount, description?: string, date: Date, comment?: string, ignored?: boolean }) {
        this.amount = transaction.amount
        this.category = transaction.category ?? null
        this.description = transaction.description ?? ''
        this.date = transaction.date
        this.comment = transaction.comment ?? ''
        this.ignored = !!transaction.ignored
        this.type = (this.amount.value >= 0) ? 'INCOME' : 'EXPENSE'
    }

    public static create(transaction: { category?: Category, amount: number, description?: string, date: Date, comment?: string, ignored?: boolean }): Either<InvalidTransactionError | InvalidAmountError, WalletTransaction> {

        if(!transaction.description) {
            return left(new InvalidTransactionError('Required some description'))
        }

        if(transaction.amount === 0) {
            return left(new InvalidTransactionError('Invalid amount'))
        }

        const amountOrError = Amount.create(transaction.amount)

        if(amountOrError.isLeft()) {
            return left(amountOrError.value)
        }

        const amount = amountOrError.value as Amount

        return right(new WalletTransaction({ 
            amount, 
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            comment: transaction.comment,
            ignored: transaction.ignored,
        }))
    }
}