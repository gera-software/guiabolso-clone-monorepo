import { ManualCreditCardAccount, CreditCardTransaction, Institution, User, NubankCreditCardInvoiceStrategy } from "@/entities"
import { InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"

describe("Manual Credit Card Account entity", () => {

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
    
            const error = ManualCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as Error
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
    
            const error = ManualCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as Error
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
    
            const error = ManualCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as Error
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
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount
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
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount
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

    /**
     * OBS: rules valid to nubank credit cards, other banks could have diferent rules
     */
    describe('calculate invoice due date from transaction', () => {

        test('transactions before closing date should belong to current month\'s invoice', () => {
            const validClosingDate = new Date('2023-10-25')
            const validDueDate = new Date('2023-11-01')

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
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount
            
            const transactionDate = new Date('2023-10-24')
            const { invoiceDueDate, invoiceClosingDate } = account.calculateInvoiceDatesFromTransaction(transactionDate)
            expect(invoiceDueDate).toBeInstanceOf(Date)
            expect(invoiceClosingDate).toBeInstanceOf(Date)
        })
    })

    describe('add transaction', () => {
        test('should add an expense to avaliable credit limit', () => {
            const validClosingDate = new Date('2023-10-25')
            const validDueDate = new Date('2023-11-01')
            const validAvaliableCreditLimit = 50000

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: validAvaliableCreditLimit,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount

            const transaction = CreditCardTransaction.create({ 
                amount: -35000, 
                description: 'valid transaction', 
                transactionDate: new Date('2023-11-01'), 
                invoiceDate: new Date('2023-10-23'),
             }).value as CreditCardTransaction
            
            account.addTransaction(transaction)

            expect(account.creditCardInfo.availableCreditLimit.value).toBe(validAvaliableCreditLimit + transaction.amount.value)
            
        })

        test('should add an income to avaliable credit limit', () => {
            const validClosingDate = new Date('2023-10-25')
            const validDueDate = new Date('2023-11-01')
            const validAvaliableCreditLimit = 50000

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: validAvaliableCreditLimit,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount

            const transaction = CreditCardTransaction.create({ 
                amount: 35000, 
                description: 'valid transaction', 
                transactionDate: new Date('2023-11-01'), 
                invoiceDate: new Date('2023-10-23'),
             }).value as CreditCardTransaction
            
            account.addTransaction(transaction)

            expect(account.creditCardInfo.availableCreditLimit.value).toBe(validAvaliableCreditLimit + transaction.amount.value)
            
        })
    })

    describe('remove transaction', () => {
        test('should subtract an expense from avaliable credit limit', () => {
            const validClosingDate = new Date('2023-10-25')
            const validDueDate = new Date('2023-11-01')
            const validAvaliableCreditLimit = 50000

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: validAvaliableCreditLimit,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount

            const transaction = CreditCardTransaction.create({ 
                amount: -35000, 
                description: 'valid transaction', 
                transactionDate: new Date('2023-11-01'), 
                invoiceDate: new Date('2023-10-23'),
             }).value as CreditCardTransaction
            
            account.removeTransaction(transaction)

            expect(account.creditCardInfo.availableCreditLimit.value).toBe(validAvaliableCreditLimit - transaction.amount.value)
            
            
        })

        test('should subtract an income from avaliable credit limit', () => {
            const validClosingDate = new Date('2023-10-25')
            const validDueDate = new Date('2023-11-01')
            const validAvaliableCreditLimit = 50000

            const name = 'valid name'
            const balance = 300
            const imageUrl = 'valid image url'
            const creditCardInfo = {
                brand: 'Master Card',
                creditLimit: 100000,
                availableCreditLimit: validAvaliableCreditLimit,
                closeDay: validClosingDate.getUTCDate(),
                dueDay: validDueDate.getUTCDate(),
            }
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
    
            const account = ManualCreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}, new NubankCreditCardInvoiceStrategy() ).value as ManualCreditCardAccount

            const transaction = CreditCardTransaction.create({ 
                amount: 35000, 
                description: 'valid transaction', 
                transactionDate: new Date('2023-11-01'), 
                invoiceDate: new Date('2023-10-23'),
             }).value as CreditCardTransaction
            
            account.removeTransaction(transaction)

            expect(account.creditCardInfo.availableCreditLimit.value).toBe(validAvaliableCreditLimit - transaction.amount.value)
            
            
        })
    })
})