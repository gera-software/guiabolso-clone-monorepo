import { WalletAccount } from "@/entities"
import { InvalidNameError } from "@/entities/errors"
import { WalletAccountData } from "@/usecases/ports"

describe("Wallet Account entity", () => {
    test("should not create an account with empty name", () => {
        const WalletAccountData: WalletAccountData = {
            name: ''
        }
        const error = WalletAccount.create(WalletAccountData).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
    })
})