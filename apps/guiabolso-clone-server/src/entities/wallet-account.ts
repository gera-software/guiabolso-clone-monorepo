import { left, right } from "@/shared"
import { WalletAccountData } from "@/usecases/ports"
import { InvalidBalanceError, InvalidNameError } from "./errors"

export class WalletAccount {
    public readonly name: string
    public readonly balance: number
    public readonly imageUrl?: string

    private constructor({ name, balance, imageUrl }: WalletAccountData) {
        this.name = name
        this.balance = balance
        this.imageUrl = imageUrl
    }

    public static create(walletAccountData: WalletAccountData) {

        if(!walletAccountData.name) {
            return left(new InvalidNameError)
        }

        if(!Number.isInteger(walletAccountData.balance)) {
            return left(new InvalidBalanceError)
        }

        return right(new WalletAccount(walletAccountData))
    }
}