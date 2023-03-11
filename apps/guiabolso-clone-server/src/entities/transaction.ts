import { TransactionData } from "@/usecases/ports"
import { InvalidTransactionError } from "@/entities/errors"
import { left, right } from "@/shared"
import { Account, Category, User } from "@/entities"

export class Transaction {
    public readonly account: Account
    public readonly category: Category

    private constructor(transaction: { account: Account, category: Category }) {
        this.account = transaction.account
        this.category = transaction.category ?? null
    }

    public static create(transaction: { account: Account, category?: Category }) {

        if(!transaction.account) {
            return left(new InvalidTransactionError('Invalid account'))
        }

        return right(new Transaction({ account: transaction.account, category: transaction.category }))
    }
}