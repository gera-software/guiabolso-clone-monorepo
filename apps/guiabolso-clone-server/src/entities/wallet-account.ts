import { left, right } from "@/shared"
import { InvalidBalanceError, InvalidNameError } from "./errors"
import { User } from "@/entities"

export class WalletAccount {
    public readonly name: string
    public readonly balance: number
    public readonly imageUrl?: string
    public readonly user: User

    private constructor(wallet: {name: string, balance: number, imageUrl?: string, user: User}) {
        this.name = wallet.name
        this.balance = wallet.balance
        this.imageUrl = wallet.imageUrl
        this.user = wallet.user
    }

    public static create(wallet : { name: string, balance: number, imageUrl: string, user: User }) {
        const { name, balance, imageUrl, user } = wallet

        if(!name) {
            return left(new InvalidNameError)
        }

        if(!Number.isInteger(balance)) {
            return left(new InvalidBalanceError)
        }

        return right(new WalletAccount({name, balance, imageUrl, user}))
    }
}