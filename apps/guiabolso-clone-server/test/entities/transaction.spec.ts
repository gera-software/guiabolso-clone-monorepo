import { Account, Transaction, User, WalletAccount } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"

describe("Transaction entity", () => {
    const name = 'valid name'
    const balance = 300
    const imageUrl = 'valid image url'
    const user = User.create({
        name: 'user name',
        email: 'user@email',
        password: 'user password',
    }).value as User
    const walletAccount = WalletAccount.create({name, balance, imageUrl, user}).value as WalletAccount


    test("should not create transaction with empty account", () => {
        const error = Transaction.create({ account: null }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid account')
    })

    test("should create transaction with valid account", () => {
        const transaction = Transaction.create({ account: walletAccount }).value as Transaction
        expect(transaction.account).toEqual(walletAccount)
    })

})