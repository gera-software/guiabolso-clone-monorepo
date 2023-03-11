import { Account, Category, Transaction, User, WalletAccount } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"

describe("Transaction entity", () => {
    const name = 'valid name'
    const balance = 300
    const imageUrl = 'valid image url'
    const user = User.create({
        name: 'user name',
        email: 'user@email.com',
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
        const amount = 1900
        const description = 'transaction description'
        const error = Transaction.create({ account: null, amount, description }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid account')
    })

    test("should not create transaction with zero amount", () => {
        const description = 'transaction description'
        const error = Transaction.create({ account: walletAccount, amount: 0, description }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid amount')
    })

    test("should create transaction with valid account", () => {
        const amount = 1900
        const description = 'transaction description'
        const transaction = Transaction.create({ account: walletAccount, amount, description }).value as Transaction
        expect(transaction.account).toEqual(walletAccount)
        expect(transaction.category).toEqual(null)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        expect(transaction.descriptionOriginal).toEqual('')
    })

    test("should create transaction with optional category", () => {
        const amount = 1900
        const description = 'transaction description'
        const transaction = Transaction.create({ account: walletAccount, amount, category, description }).value as Transaction
        expect(transaction.account).toEqual(walletAccount)
        expect(transaction.category).toEqual(category)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        expect(transaction.descriptionOriginal).toEqual('')
    })

    test("should not create transaction without description or descriptionOriginal", () => {
        const amount = 1900
        const error = Transaction.create({ account: walletAccount, amount, category }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Required some description')
    })

    test("should create transaction with descriptionOriginal", () => {
        const amount = 1900
        const description = 'transaction description'
        const transaction = Transaction.create({ account: walletAccount, amount, descriptionOriginal: description }).value as Transaction
        expect(transaction.account).toEqual(walletAccount)
        expect(transaction.category).toEqual(null)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.descriptionOriginal).toEqual(description)
        expect(transaction.description).toEqual('')
    })

})