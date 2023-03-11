import { Account, Category, Transaction, User, WalletAccount } from "@/entities"
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
    
    const category = Category.create({
        name: 'valid name',
        group: 'GROUPNAME',
        iconName: 'icon name',
        primaryColor: 'color',
        ignored: false,
    }).value as Category

    test("should not create transaction with empty account", () => {
        const error = Transaction.create({ account: null }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid account')
    })

    test("should create transaction with valid account", () => {
        const transaction = Transaction.create({ account: walletAccount }).value as Transaction
        expect(transaction.account).toEqual(walletAccount)
        expect(transaction.category).toEqual(null)
    })
    
    test("should create transaction with optional category", () => {
        const transaction = Transaction.create({ account: walletAccount, category }).value as Transaction
        expect(transaction.account).toEqual(walletAccount)
        expect(transaction.category).toEqual(category)
    })

})