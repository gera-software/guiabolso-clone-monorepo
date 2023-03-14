import { Either, left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "./errors"
import { AccountType, Amount, SyncType, Transaction, User } from "@/entities"
import { Account } from "@/entities"

export class WalletAccount implements Account {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User
    public readonly type: AccountType = 'WALLET'
    public readonly syncType: SyncType = 'MANUAL'

    private constructor(wallet: {name: string, balance: Amount, imageUrl?: string, user: User}) {
        this.name = wallet.name
        this.balance = wallet.balance
        this.imageUrl = wallet.imageUrl
        this.user = wallet.user
    }


    public static create(wallet: { name: string, balance: number, imageUrl?: string, user: User }): Either<InvalidNameError | InvalidBalanceError, WalletAccount> {
        const { name, balance, imageUrl, user } = wallet

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

    public addTransaction(transaction: Transaction) {
        this.balance.add(transaction.amount.value)
    }

    public removeTransaction(transaction: Transaction) {
        this.balance.subtract(transaction.amount.value)
    }
}