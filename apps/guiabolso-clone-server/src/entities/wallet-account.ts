import { left } from "@/shared"
import { WalletAccountData } from "@/usecases/ports"
import { InvalidNameError } from "./errors"

export class WalletAccount {
    public readonly name: string

    private constructor(name: string) {
        this.name = name
    }

    public static create(walletAccountData: WalletAccountData) {
        return left(new InvalidNameError)
    }
}