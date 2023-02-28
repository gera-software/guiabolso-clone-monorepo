import { WalletAccount } from "@/entities"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"
import { WalletAccountData } from "@/usecases/ports"

describe("Wallet Account entity", () => {
    test("should not create an account with empty name", () => {
        const accountData: WalletAccountData = {
            name: '',
            balance: 0,
            imageUrl: 'valid image url',
        }
        const error = WalletAccount.create(accountData).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
    })

    test("should not create an account with not integer balance", () => {
        const accountData: WalletAccountData = {
            name: 'valid name',
            balance: 4.5,
            imageUrl: 'valid image url',
        }
        const error = WalletAccount.create(accountData).value as Error
        expect(error).toBeInstanceOf(InvalidBalanceError)
    })

    test("should create an account with valid params", () => {
        const accountData: WalletAccountData = {
            name: 'valid name',
            balance: 300,
            imageUrl: 'valid image url',
        }
        const account = WalletAccount.create(accountData).value as WalletAccountData
        expect(account.name).toBe(accountData.name)
        expect(account.balance).toBe(accountData.balance)
        expect(account.imageUrl).toBe(accountData.imageUrl)
    })
})