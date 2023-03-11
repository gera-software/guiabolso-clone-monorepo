import { TransactionData } from "@/usecases/ports"
import { InvalidTransactionError } from "@/entities/errors"
import { left, right } from "@/shared"
import { Account, User } from "@/entities"

export class Transaction {
    public readonly account: Account

    private constructor(transaction: { account: Account }) {
        this.account = transaction.account
    }

    public static create(transaction: { account: Account }) {

        if(!transaction.account) {
            return left(new InvalidTransactionError('Invalid account'))
        }

        return right(new Transaction({ account: transaction.account }))
    }
}