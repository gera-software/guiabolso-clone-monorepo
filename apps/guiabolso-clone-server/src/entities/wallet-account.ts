import { Either, left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"
import { Account, AccountType, Amount, SyncType, User, WalletTransaction } from "@/entities"

export class WalletAccount implements Account {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'WALLET'
    public readonly syncType: SyncType = 'MANUAL'

    private constructor(account: {name: string, balance: Amount, imageUrl?: string, user: User}) {
        this.name = account.name
        this.balance = account.balance
        this.imageUrl = account.imageUrl
        this.user = account.user
    }


    public static create(account: { name: string, balance: number, imageUrl?: string, user: User }): Either<InvalidNameError | InvalidBalanceError, WalletAccount> {
        const { name, balance, imageUrl, user } = account

        if(!name) {
            return left(new InvalidNameError())
        }

        const balanceOrError = Amount.create(balance) 
        if(balanceOrError.isLeft()) {
            return left(new InvalidBalanceError())
        }

        const amount = balanceOrError.value as Amount

        return right(new WalletAccount({name, balance: amount, imageUrl, user}))
    }

    public addTransaction(transaction: WalletTransaction) {
        this.balance.add(transaction.amount.value)
    }

    public removeTransaction(transaction: WalletTransaction) {
        this.balance.subtract(transaction.amount.value)
    }
}