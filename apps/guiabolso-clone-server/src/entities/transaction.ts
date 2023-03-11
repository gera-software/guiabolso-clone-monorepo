import { TransactionData } from "@/usecases/ports"
import { InvalidTransactionError } from "@/entities/errors"
import { left, right } from "@/shared"
import { Account, Amount, Category, User } from "@/entities"

export class Transaction {
    public readonly account: Account
    public readonly category: Category
    public readonly amount: Amount
    public readonly description: string
    public readonly descriptionOriginal: string

    private constructor(transaction: { account: Account, category: Category, amount: Amount, description?: string, descriptionOriginal?: string }) {
        this.account = transaction.account
        this.amount = transaction.amount
        this.category = transaction.category ?? null
        this.description = transaction.description ?? ''
        this.descriptionOriginal = transaction.descriptionOriginal ?? ''
    }

    public static create(transaction: { account: Account, category?: Category, amount: number, description?: string, descriptionOriginal?: string }) {

        if(!transaction.account) {
            return left(new InvalidTransactionError('Invalid account'))
        }

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

        return right(new Transaction({ 
            account: transaction.account, 
            amount, 
            category: transaction.category,
            description: transaction.description,
            descriptionOriginal: transaction.descriptionOriginal,
        }))
    }
}