import { TransactionData } from "@/usecases/ports"
import { InvalidTransactionError } from "@/entities/errors"
import { left } from "@/shared"
import { User } from "@/entities"

export class Transaction {
    private constructor() {

    }

    public static create(transaction: { user: User }) {
        return left(new InvalidTransactionError('Invalid user'))
    }
}