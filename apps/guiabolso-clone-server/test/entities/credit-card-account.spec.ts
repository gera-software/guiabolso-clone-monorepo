import { CreditCardAccount, Institution, User } from "@/entities"
import { InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"

describe("Credit Card Account entity", () => {

    describe('create', () => {
        test("should not create an account with empty name", () => {
            const name = ''
            const balance = 0
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10,
            }
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
    
            const error = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as Error
            expect(error).toBeInstanceOf(InvalidNameError)
        })
    
        test("should not create an account with not integer balance", () => {
            const name = 'valid name'
            const balance = 4.6
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10,
            }
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
    
            const error = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as Error
            expect(error).toBeInstanceOf(InvalidBalanceError)
        })
    
        test("should not create an account with invalid credit card info", () => {
            const name = 'valid name'
            const balance = 47
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: '',
                creditLimit: 1000.40,
                availableCreditLimit: 500.34,
                closeDay: 0,
                dueDay: 32,
            }
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
    
            const error = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as Error
            expect(error).toBeInstanceOf(InvalidCreditCardError)
            expect(error.message).toBe('Invalid credit card params: brand, closeDay, dueDay, creditLimit, availableCreditLimit')
        })
    
        test("should create an account with valid params", () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10,
            }
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
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            expect(account.type).toBe('CREDIT_CARD')
            expect(account.syncType).toBe('MANUAL')
            expect(account.name).toBe(name)
            expect(account.balance.value).toBe(balance)
            expect(account.imageUrl).toBe(imageUrl)
            expect(account.user.name).toBe(user.name)
            expect(account.user.email).toBe(user.email)
            expect(account.institution.id).toEqual(institution.id)
            expect(account.creditCardInfo.brand).toEqual(creditCardInfo.brand)
            expect(account.creditCardInfo.creditLimit.value).toEqual(creditCardInfo.creditLimit)
            expect(account.creditCardInfo.availableCreditLimit.value).toEqual(creditCardInfo.availableCreditLimit)
            expect(account.creditCardInfo.closeDay).toEqual(creditCardInfo.closeDay)
            expect(account.creditCardInfo.dueDay).toEqual(creditCardInfo.dueDay)
        })
    
        test("should create an account without institution", () => {
            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10,
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
            expect(account.type).toBe('CREDIT_CARD')
            expect(account.syncType).toBe('MANUAL')
            expect(account.name).toBe(name)
            expect(account.balance.value).toBe(balance)
            expect(account.imageUrl).toBe(imageUrl)
            expect(account.user.name).toBe(user.name)
            expect(account.user.email).toBe(user.email)
            expect(account.institution).toBeFalsy()
            expect(account.creditCardInfo.brand).toEqual(creditCardInfo.brand)
            expect(account.creditCardInfo.creditLimit.value).toEqual(creditCardInfo.creditLimit)
            expect(account.creditCardInfo.availableCreditLimit.value).toEqual(creditCardInfo.availableCreditLimit)
            expect(account.creditCardInfo.closeDay).toEqual(creditCardInfo.closeDay)
            expect(account.creditCardInfo.dueDay).toEqual(creditCardInfo.dueDay)
        })
    })

    describe('calculate invoice due date from transaction', () => {
        test('transactions on closing date should belong to next month invoice', () => {
            const validClosingDate = new Date('2023-03-03')
            const validDueDate = new Date('2023-04-10')

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
            
            const transactionDate = new Date(validClosingDate) // 2023-03-03
            const invoiceDate = account.calculateInvoiceDueDateFromTransaction(transactionDate)
            expect(invoiceDate).toEqual(validDueDate)
        })

        test('transactions after closing date should belong to next month invoice', () => {
            const validClosingDate = new Date('2023-03-03')
            const validDueDate = new Date('2023-04-10')

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
            
            const transactionDate = new Date(validClosingDate)
            transactionDate.setDate(transactionDate.getDate() + 1); // 2023-03-04
            const invoiceDate = account.calculateInvoiceDueDateFromTransaction(transactionDate)
            expect(invoiceDate).toEqual(validDueDate)
        })

        test('transactions before closing date should belong to current month invoice', () => {
            const validClosingDate = new Date('2023-03-03')
            const validDueDate = new Date('2023-03-10')

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
            
            const transactionDate = new Date(validClosingDate)
            transactionDate.setDate(transactionDate.getDate() - 1); // 2023-03-02
            const invoiceDate = account.calculateInvoiceDueDateFromTransaction(transactionDate)
            expect(invoiceDate).toEqual(validDueDate)
        })

        test('transactions on december closing date should belong to next year', () => {
            const validClosingDate = new Date('2023-12-25')
            const validDueDate = new Date('2024-01-01')

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
            
            const transactionDate = new Date(validClosingDate)
            transactionDate.setDate(transactionDate.getDate()); // 2023-12-25
            const invoiceDate = account.calculateInvoiceDueDateFromTransaction(transactionDate)
            expect(invoiceDate).toEqual(validDueDate)
        })

        test('transactions before december closing date should belong to current year', () => {
            const validClosingDate = new Date('2023-12-25')
            const validDueDate = new Date('2023-12-01')

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
            
            const transactionDate = new Date(validClosingDate)
            transactionDate.setDate(transactionDate.getDate() - 1); // 2023-12-24
            const invoiceDate = account.calculateInvoiceDueDateFromTransaction(transactionDate)
            expect(invoiceDate).toEqual(validDueDate)
        })
    })
})