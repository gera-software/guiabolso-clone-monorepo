import { Category, Transaction, TransactionType } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"

describe("Transaction entity", () => {
    // const name = 'valid name'
    // const balance = 300
    // const imageUrl = 'valid image url'
    // const user = User.create({
    //     name: 'user name',
    //     email: 'user@email.com',
    //     password: 'user password',
    // }).value as User
    // const walletAccount = WalletAccount.create({name, balance, imageUrl, user}).value as WalletAccount
    
    const category = Category.create({
        name: 'valid name',
        group: 'GROUPNAME',
        iconName: 'icon name',
        primaryColor: 'color',
        ignored: false,
    }).value as Category

    test("should not create transaction without description or descriptionOriginal", () => {
        const amount = -1900
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const error = Transaction.create({ amount, category, date, type }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Required some description')
    })

    test("should not create transaction with zero amount", () => {
        const amount = 0
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const error = Transaction.create({ amount, description, date, type }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid amount')
    })

    test("should not create transaction type EXPENSE if amount is positive", () => {
        const amount = 3459
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const error = Transaction.create({ amount, description, date, type }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('An expense should have a negative amount')
    })

    test("should not create transaction type INCOME if amount is negative", () => {
        const amount = -3459
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'INCOME'
        const error = Transaction.create({ amount, description, date, type }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('An income should have a positive amount')
    })

    test("should create transaction type expense", () => {
        const amount = -1900
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const comment = 'comentario válido'
        const ignored = true
        const transaction = Transaction.create({ amount, description, date, type, comment, ignored }).value as Transaction
        expect(transaction.category).toEqual(null)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        expect(transaction.descriptionOriginal).toEqual('')
        expect(transaction.date.toISOString()).toEqual('2023-01-23T00:00:00.000Z')
        expect(transaction.type).toEqual(type)
        expect(transaction.comment).toEqual(comment)
        expect(transaction.ignored).toEqual(ignored)
    })

    test("should create transaction type income", () => {
        const amount = 1900
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'INCOME'
        const comment = 'comentario válido'
        const ignored = true
        const transaction = Transaction.create({ amount, description, date, type, comment, ignored }).value as Transaction
        expect(transaction.category).toEqual(null)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        expect(transaction.descriptionOriginal).toEqual('')
        expect(transaction.date.toISOString()).toEqual('2023-01-23T00:00:00.000Z')
        expect(transaction.type).toEqual(type)
        expect(transaction.comment).toEqual(comment)
        expect(transaction.ignored).toEqual(ignored)
    })

    test("should create transaction with optional category", () => {
        const amount = -1900
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const transaction = Transaction.create({ amount, category, description, date, type }).value as Transaction
        expect(transaction.category).toEqual(category)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        expect(transaction.descriptionOriginal).toEqual('')
        expect(transaction.type).toEqual(type)
        expect(transaction.comment).toEqual('')
        expect(transaction.ignored).toEqual(false)
    })

    test("should create transaction with only descriptionOriginal", () => {
        const amount = -1900
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const transaction = Transaction.create({ amount, descriptionOriginal: description, date, type }).value as Transaction
        expect(transaction.descriptionOriginal).toEqual(description)
        expect(transaction.description).toEqual('')
    })

})