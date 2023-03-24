import { BankAccount, BankTransaction, Institution, User } from "@/entities"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"

describe("Bank Account entity", () => {
    describe('create', () => {
        test("should not create an account with empty name", () => {
            const name = ''
            const balance = 0
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
            const institution = Institution.create({
                id: 'valid id', 
                name: 'valid name', 
                type: "PERSONAL_BANK", 
                imageUrl: 'valid url', 
                primaryColor: 'valid color', 
                providerConnectorId: 'valid id'
            }).value as Institution
    
            const error = BankAccount.create({name, balance, imageUrl, user, institution}).value as Error
            expect(error).toBeInstanceOf(InvalidNameError)
        })
    
        test("should not create an account with not integer balance", () => {
            const name = 'valid name'
            const balance = 4.6
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
            const institution = Institution.create({
                id: 'valid id', 
                name: 'valid name', 
                type: "PERSONAL_BANK", 
                imageUrl: 'valid url', 
                primaryColor: 'valid color', 
                providerConnectorId: 'valid id'
            }).value as Institution
    
            const error = BankAccount.create({name, balance, imageUrl, user, institution}).value as Error
            expect(error).toBeInstanceOf(InvalidBalanceError)
        })
    
        test("should create an account with valid params", () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
            const institution = Institution.create({
                id: 'valid id', 
                name: 'valid name', 
                type: "PERSONAL_BANK", 
                imageUrl: 'valid url', 
                primaryColor: 'valid color', 
                providerConnectorId: 'valid id'
            }).value as Institution
    
            const account = BankAccount.create({name, balance, imageUrl, user, institution}).value as BankAccount
            expect(account.type).toBe('BANK')
            expect(account.name).toBe(name)
            expect(account.balance.value).toBe(balance)
            expect(account.imageUrl).toBe(imageUrl)
            expect(account.user.name).toBe(user.name)
            expect(account.user.email).toBe(user.email)
            expect(account.institution.id).toEqual(institution.id)
        })
    
        test("should create an account without institution", () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = BankAccount.create({name, balance, imageUrl, user}).value as BankAccount
            expect(account.type).toBe('BANK')
            expect(account.syncType).toBe('MANUAL')
            expect(account.name).toBe(name)
            expect(account.balance.value).toBe(balance)
            expect(account.imageUrl).toBe(imageUrl)
            expect(account.user.name).toBe(user.name)
            expect(account.user.email).toBe(user.email)
            expect(account.institution).toBeFalsy()
        })
    })

    describe('add transaction', () => {
        test('should update balance if add a valid income transaction', () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = BankAccount.create({name, balance, imageUrl, user}).value as BankAccount

            const transaction = BankTransaction.create({ 
                amount: 2567, 
                category: null, 
                description: 'valid description', 
                date: new Date('2023-03-19'),
            }).value as BankTransaction

            account.addTransaction(transaction)
            expect(account.balance.value).toBe(balance + transaction.amount.value)
        })

        test('should update balance if add a valid expense transaction', () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = BankAccount.create({name, balance, imageUrl, user}).value as BankAccount

            const transaction = BankTransaction.create({ 
                amount: -2567, 
                category: null, 
                description: 'valid description', 
                date: new Date('2023-03-19'),
            }).value as BankTransaction

            account.addTransaction(transaction)
            expect(account.balance.value).toBe(balance + transaction.amount.value)
        })
    })

    describe('remove transaction', () => {
        test('should update balance if subtract a valid income transaction', () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = BankAccount.create({name, balance, imageUrl, user}).value as BankAccount

            const transaction = BankTransaction.create({ 
                amount: 2567, 
                category: null, 
                description: 'valid description', 
                date: new Date('2023-03-19'),
            }).value as BankTransaction

            account.removeTransaction(transaction)
            expect(account.balance.value).toBe(balance - transaction.amount.value)
        })

        test('should update balance if subtract a valid expense transaction', () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = BankAccount.create({name, balance, imageUrl, user}).value as BankAccount

            const transaction = BankTransaction.create({ 
                amount: -2567, 
                category: null, 
                description: 'valid description', 
                date: new Date('2023-03-19'),
            }).value as BankTransaction

            account.removeTransaction(transaction)
            expect(account.balance.value).toBe(balance - transaction.amount.value)
        })
    })
})