import { AutomaticCreditCardAccount, Institution, MergeStatus, NubankCreditCardInvoiceStrategy, ProviderSyncStatus, User } from "@/entities"
import { InvalidAccountError, InvalidBalanceError, InvalidCreditCardError, InvalidInstitutionError, InvalidNameError } from "@/entities/errors"

describe("Automatic Credit Card Account entity", () => {
    describe('create', () => {
        test("should not create an account with empty name", () => {
            const name = ''
            const balance = -6789
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidNameError)
        })

        test("should not create an account with not integer balance", () => {
            const name = 'valid name'
            const balance = -4.6
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidBalanceError)

        })

        test("should not create an account with invalid credit card info", () => {
            const name = 'valid name'
            const balance = -6789
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidCreditCardError)
            expect(error.message).toBe('Invalid credit card params: brand, closeDay, dueDay, creditLimit, availableCreditLimit')

        })

        test("should not create an account without an institution", () => {
            const name = 'valid name'
            const balance = -6789
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
            const institution: Institution = null
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidInstitutionError)

        })

        test("should not create an account without providerAccountId", () => {
            const name = 'valid name'
            const balance = -6789
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
            const providerAccountId = ''
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('providerAccountId is required')

        })

        test("should not create an account without providerItemId", () => {
            const name = 'valid name'
            const balance = -6789
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = ''
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('providerItemId is required')

        })

        test("should not create an account without createdAt", () => {
            const name = 'valid name'
            const balance = -6789
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt: Date = null
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('createdAt is required')

        })

        test("should not create an account without syncStatus", () => {
            const name = 'valid name'
            const balance = -6789
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt: Date = new Date()
            const syncStatus: ProviderSyncStatus = null
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'

            const error = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('syncStatus is required')

        })

        test("should create an account with valid params", () => {
            const name = 'valid name'
            const balance = -6789
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
            const syncStatus: ProviderSyncStatus = 'UPDATED'
            const lastSyncAt = new Date()
            const lastMergeAt = new Date()
            const mergeStatus: MergeStatus = 'MERGED'
    
            const account = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as AutomaticCreditCardAccount
            expect(account.type).toBe('CREDIT_CARD')
            expect(account.syncType).toBe('AUTOMATIC')
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
            expect(account.providerAccountId).toEqual(providerAccountId)
            expect(account.synchronization.providerItemId).toEqual(providerItemId)
            expect(account.synchronization.createdAt).toEqual(createdAt)
            expect(account.synchronization.syncStatus).toEqual(syncStatus)
            expect(account.synchronization.lastSyncAt).toEqual(lastSyncAt)
            expect(account.synchronization.lastMergeAt).toEqual(lastMergeAt)
            expect(account.synchronization.mergeStatus).toEqual(mergeStatus)

        })
    })

    test('should calculate invoice due date from transaction', () => {
        const validClosingDate = new Date('2023-10-3')
        const validDueDate = new Date('2023-10-10')

        const name = 'valid name'
        const balance = -6789
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
        const institution = Institution.create({
            id: 'valid id', 
            name: 'valid name', 
            type: "PERSONAL_BANK", 
            imageUrl: 'valid url', 
            primaryColor: 'valid color', 
            providerConnectorId: 'valid id'
        }).value as Institution
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const account = AutomaticCreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo, providerAccountId, providerItemId, createdAt, syncStatus, lastSyncAt, lastMergeAt, mergeStatus}, new NubankCreditCardInvoiceStrategy() ).value as AutomaticCreditCardAccount
        const transactionDate = new Date('2023-10-24')
        const { invoiceDueDate, invoiceClosingDate } = account.calculateInvoiceDatesFromTransaction(transactionDate)
        expect(invoiceDueDate).toBeInstanceOf(Date)
        expect(invoiceClosingDate).toBeInstanceOf(Date)
    })

})