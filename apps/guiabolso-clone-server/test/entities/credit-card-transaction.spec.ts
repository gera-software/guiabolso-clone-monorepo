import { Category, CreditCardTransaction, TransactionType } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"

describe("Credit Card Transaction entity", () => {
    const category = Category.create({
        name: 'valid name',
        group: 'GROUPNAME',
        iconName: 'icon name',
        primaryColor: 'color',
        ignored: false,
    }).value as Category

    test("should not create transaction without description", () => {
        const amount = -1900
        const date = new Date('2023-01-23')
        const error = CreditCardTransaction.create({ amount, category, date }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Required some description')
    })

    test("should not create transaction with zero amount", () => {
        const amount = 0
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const error = CreditCardTransaction.create({ amount, description, date }).value as Error
        expect(error).toBeInstanceOf(InvalidTransactionError)
        expect(error.message).toBe('Invalid amount')
    })

    test("should create transaction type expense", () => {
        const amount = -1900
        const description = 'transaction description'
        const date = new Date('2023-01-23')
        const type: TransactionType = 'EXPENSE'
        const comment = 'comentario válido'
        const ignored = true
        const transaction = CreditCardTransaction.create({ amount, description, date, comment, ignored }).value as CreditCardTransaction
        expect(transaction.category).toEqual(null)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        // expect(transaction.descriptionOriginal).toEqual('')
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
        const transaction = CreditCardTransaction.create({ amount, description, date, comment, ignored }).value as CreditCardTransaction
        expect(transaction.category).toEqual(null)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        // expect(transaction.descriptionOriginal).toEqual('')
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
        const transaction = CreditCardTransaction.create({ amount, category, description, date }).value as CreditCardTransaction
        expect(transaction.category).toEqual(category)
        expect(transaction.amount.value).toEqual(amount)
        expect(transaction.description).toEqual(description)
        // expect(transaction.descriptionOriginal).toEqual('')
        expect(transaction.type).toEqual(type)
        expect(transaction.comment).toEqual('')
        expect(transaction.ignored).toEqual(false)
    })

})