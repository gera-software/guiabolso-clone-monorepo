import { Transaction, User, WalletAccount } from "@/entities"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"

describe("Wallet Account entity", () => {
    describe('create', () => {
        test("should not create an account with empty name", () => {
            const name = ''
            const balance = 0
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email',
                password: 'user password',
            }).value as User
       
            const error = WalletAccount.create({name, balance, imageUrl, user}).value as Error
            expect(error).toBeInstanceOf(InvalidNameError)
        })
    
        test("should not create an account with not integer balance", () => {
            const name = 'valid name'
            const balance = 4.6
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email',
                password: 'user password',
            }).value as User
            const error = WalletAccount.create({name, balance, imageUrl, user}).value as Error
            expect(error).toBeInstanceOf(InvalidBalanceError)
        })
    
        test("should create an account with valid params", () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email',
                password: 'user password',
            }).value as User
            const account = WalletAccount.create({name, balance, imageUrl, user}).value as WalletAccount
            expect(account.type).toBe('WALLET')
            expect(account.syncType).toBe('MANUAL')
            expect(account.name).toBe(name)
            expect(account.balance.value).toBe(balance)
            expect(account.imageUrl).toBe(imageUrl)
            expect(account.user.name).toBe(user.name)
            expect(account.user.email).toBe(user.email)
        })
    })

    describe('add transaction', () => {
        test('should update balance if add a valid income transaction', () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email',
                password: 'user password',
            }).value as User
            const account = WalletAccount.create({name, balance, imageUrl, user}).value as WalletAccount

            const transaction = Transaction.create({ 
                amount: 2567, 
                category: null, 
                description: 'valid description', 
                date: new Date('2023-03-19'), 
                type: 'INCOME'
            }).value as Transaction

            account.addTransaction(transaction)
            expect(account.balance.value).toBe(balance + transaction.amount.value)
        })

        test('should update balance if add a valid expense transaction', () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email',
                password: 'user password',
            }).value as User
            const account = WalletAccount.create({name, balance, imageUrl, user}).value as WalletAccount

            const transaction = Transaction.create({ 
                amount: -2567, 
                category: null, 
                description: 'valid description', 
                date: new Date('2023-03-19'), 
                type: 'EXPENSE'
            }).value as Transaction

            account.addTransaction(transaction)
            expect(account.balance.value).toBe(balance + transaction.amount.value)
        })
    })
})