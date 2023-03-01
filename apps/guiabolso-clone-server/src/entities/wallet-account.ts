import { left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "./errors"
import { Amount, User } from "@/entities"
import { Account } from "@/entities"

export class WalletAccount implements Account {
    public readonly name: string
    public readonly balance: Amount
    public readonly imageUrl?: string
    public readonly user: User

    private constructor(wallet: {name: string, balance: Amount, imageUrl?: string, user: User}) {
        this.name = wallet.name
        this.balance = wallet.balance
        this.imageUrl = wallet.imageUrl
        this.user = wallet.user
    }

    public static create(wallet: { name: string, balance: number, imageUrl?: string, user: User }) {
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
}