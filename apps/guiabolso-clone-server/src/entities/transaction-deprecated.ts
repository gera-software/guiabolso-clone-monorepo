import { InvalidAmountError, InvalidTransactionError } from "@/entities/errors"
import { Either, left, right } from "@/shared"
import { Amount, Category, TransactionType } from "@/entities"

export class TransactionDeprecated {
    public readonly category: Category
    public readonly amount: Amount
    public readonly description: string
    public readonly descriptionOriginal: string // TODO this field doesn't belong to wallet transactions
    public readonly date: Date
    public readonly comment: string
    public readonly ignored: boolean
    public readonly type: TransactionType

    private constructor(transaction: { category: Category, amount: Amount, description?: string, descriptionOriginal?: string, date: Date, comment?: string, ignored?: boolean }) {
        this.amount = transaction.amount
        this.category = transaction.category ?? null
        this.description = transaction.description ?? ''
        this.descriptionOriginal = transaction.descriptionOriginal ?? ''
        this.date = transaction.date
        this.comment = transaction.comment ?? ''
        this.ignored = !!transaction.ignored
        this.type = (this.amount.value >= 0) ? 'INCOME' : 'EXPENSE'
    }

    public static create(transaction: { category?: Category, amount: number, description?: string, descriptionOriginal?: string, date: Date, comment?: string, ignored?: boolean }): Either<InvalidTransactionError | InvalidAmountError, TransactionDeprecated> {

        if(!transaction.description && !transaction.descriptionOriginal) {
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

        return right(new TransactionDeprecated({ 
            amount, 
            category: transaction.category,
            description: transaction.description,
            descriptionOriginal: transaction.descriptionOriginal,
            date: transaction.date,
            comment: transaction.comment,
            ignored: transaction.ignored,
        }))
    }
}