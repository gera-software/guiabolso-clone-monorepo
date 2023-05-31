import { InvalidAccountError } from "@/entities/errors"
import { DataProviderError, UnexpectedError, UnregisteredAccountError } from "@/usecases/errors"
import { CreditCardAccountData, InstitutionData, TransactionRequest, UserData } from "@/usecases/ports"
import { SyncAutomaticCreditCardAccount } from "@/usecases/sync-automatic-credit-card-account"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryInstitutionRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Sync automatic credit card account use case', () => {
    const userId = 'u0'
    
    const userData: UserData = {
        id: userId, 
        name: 'any name', 
        email: 'any@email.com', 
        password: '123'
    }

    const institution: InstitutionData = {
        id: 'id 0',
        name: 'institution name',
        type: 'PERSONAL_BANK',
        imageUrl: 'url',
        primaryColor: 'color',
        providerConnectorId: 'valid id'
    }
    
    const accountId = 'ac0'
    const accountType = 'CREDIT_CARD'
    const syncType = 'AUTOMATIC'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000
    const providerAccountId = 'valid-provider-account-id'
    const synchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
        syncStatus: 'UPDATED',
        lastSyncAt: new Date(),
    }

    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        creditCardAccountData = {
            id: accountId,
            type: accountType,
            syncType,
            name,
            balance,
            imageUrl,
            userId,
            creditCardInfo: {
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: availableCreditLimit,
                closeDay: 3,
                dueDay: 10
            },
            institution,
            providerAccountId,
            synchronization,
        }
    })

    test('should not sync if account does not exists', async () => {
        const accountId = 'invalid-bank-account-id'

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const userRepository = new InMemoryUserRepository([userData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])

        const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not sync if account does not have a provider account id or item id', async () => {
        delete creditCardAccountData.providerAccountId
        delete creditCardAccountData.synchronization

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const userRepository = new InMemoryUserRepository([userData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])

        const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not sync if data provided has an error', async () => {
        const dataProvider = new ErrorPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const userRepository = new InMemoryUserRepository([userData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])

        const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(DataProviderError)
    })

    test('should not sync if data provider item does not have the requested account', async () => {
        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const userRepository = new InMemoryUserRepository([userData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])

        const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnexpectedError)
    })

    describe('first synchronization', () => {
        test('UPDATED: should update account balance, credit card info and synchronization status', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance - 1000,
                imageUrl,
                userId: null,
                institution: {
                    id: null,
                    name: institution.name,
                    type: institution.type,
                    imageUrl: institution.imageUrl,
                    primaryColor: institution.primaryColor,
                    providerConnectorId: institution.providerConnectorId,
                },
                creditCardInfo: {
                    brand: 'visa',
                    creditLimit: 500000,
                    availableCreditLimit: 25000,
                    closeDay: 5,
                    dueDay: 12
                },
                providerAccountId,
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                    syncStatus: 'UPDATED',
                    lastSyncAt: null,
                },
            }
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
    
            const response = (await sut.perform(accountId)).value as CreditCardAccountData
            expect(response.balance).toBe(providerAccountData1.balance)
            expect(response.synchronization.lastSyncAt).toBeNull()
    
            const updatedAccount = await accountRepository.findById(accountId)
            expect(updatedAccount.balance).toBe(providerAccountData1.balance)
            expect(updatedAccount.creditCardInfo).toEqual(providerAccountData1.creditCardInfo)
            expect(updatedAccount.synchronization.syncStatus).toBe(providerAccountData1.synchronization.syncStatus)
            expect(updatedAccount.synchronization.lastSyncAt).toBe(providerAccountData1.synchronization.lastSyncAt)
        })

        test('OUTDATED: should update synchronization status', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance - 1000,
                imageUrl,
                userId: null,
                institution: {
                    id: null,
                    name: institution.name,
                    type: institution.type,
                    imageUrl: institution.imageUrl,
                    primaryColor: institution.primaryColor,
                    providerConnectorId: institution.providerConnectorId,
                },
                creditCardInfo: {
                    brand: 'visa',
                    creditLimit: 500000,
                    availableCreditLimit: 25000,
                    closeDay: 5,
                    dueDay: 12
                },
                providerAccountId,
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                    syncStatus: 'OUTDATED',
                    lastSyncAt: null,
                },
            }

            creditCardAccountData.synchronization.syncStatus = 'UPDATED'
            creditCardAccountData.synchronization.lastSyncAt = null
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
    
            const response = (await sut.perform(accountId)).value as CreditCardAccountData
    
            const updatedAccount = await accountRepository.findById(accountId)
            expect(updatedAccount.balance).toBe(balance)
            expect(updatedAccount.creditCardInfo).toEqual(creditCardAccountData.creditCardInfo)
            expect(updatedAccount.synchronization.syncStatus).toBe(providerAccountData1.synchronization.syncStatus)
            expect(updatedAccount.synchronization.lastSyncAt).toBe(creditCardAccountData.synchronization.lastSyncAt)
        })

        test('UPDATING: should update synchronization status', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance - 1000,
                imageUrl,
                userId: null,
                institution: {
                    id: null,
                    name: institution.name,
                    type: institution.type,
                    imageUrl: institution.imageUrl,
                    primaryColor: institution.primaryColor,
                    providerConnectorId: institution.providerConnectorId,
                },
                creditCardInfo: {
                    brand: 'visa',
                    creditLimit: 500000,
                    availableCreditLimit: 25000,
                    closeDay: 5,
                    dueDay: 12
                },
                providerAccountId,
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                    syncStatus: 'UPDATING',
                    lastSyncAt: null,
                },
            }

            creditCardAccountData.synchronization.syncStatus = 'UPDATED'
            creditCardAccountData.synchronization.lastSyncAt = null
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
    
            const response = (await sut.perform(accountId)).value as CreditCardAccountData
    
            const updatedAccount = await accountRepository.findById(accountId)
            expect(updatedAccount.balance).toBe(balance)
            expect(updatedAccount.creditCardInfo).toEqual(creditCardAccountData.creditCardInfo)
            expect(updatedAccount.synchronization.syncStatus).toBe(providerAccountData1.synchronization.syncStatus)
            expect(updatedAccount.synchronization.lastSyncAt).toBe(creditCardAccountData.synchronization.lastSyncAt)
        })

        test('LOGIN_ERROR: should update synchronization status', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance - 1000,
                imageUrl,
                userId: null,
                institution: {
                    id: null,
                    name: institution.name,
                    type: institution.type,
                    imageUrl: institution.imageUrl,
                    primaryColor: institution.primaryColor,
                    providerConnectorId: institution.providerConnectorId,
                },
                creditCardInfo: {
                    brand: 'visa',
                    creditLimit: 500000,
                    availableCreditLimit: 25000,
                    closeDay: 5,
                    dueDay: 12
                },
                providerAccountId,
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                    syncStatus: 'LOGIN_ERROR',
                    lastSyncAt: null,
                },
            }

            creditCardAccountData.synchronization.syncStatus = 'UPDATED'
            creditCardAccountData.synchronization.lastSyncAt = null
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
    
            const response = (await sut.perform(accountId)).value as CreditCardAccountData
    
            const updatedAccount = await accountRepository.findById(accountId)
            expect(updatedAccount.balance).toBe(balance)
            expect(updatedAccount.creditCardInfo).toEqual(creditCardAccountData.creditCardInfo)
            expect(updatedAccount.synchronization.syncStatus).toBe(providerAccountData1.synchronization.syncStatus)
            expect(updatedAccount.synchronization.lastSyncAt).toBe(creditCardAccountData.synchronization.lastSyncAt)
        })

        test('WAITING_USER_INPUT: should update synchronization status', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance - 1000,
                imageUrl,
                userId: null,
                institution: {
                    id: null,
                    name: institution.name,
                    type: institution.type,
                    imageUrl: institution.imageUrl,
                    primaryColor: institution.primaryColor,
                    providerConnectorId: institution.providerConnectorId,
                },
                creditCardInfo: {
                    brand: 'visa',
                    creditLimit: 500000,
                    availableCreditLimit: 25000,
                    closeDay: 5,
                    dueDay: 12
                },
                providerAccountId,
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                    syncStatus: 'WAITING_USER_INPUT',
                    lastSyncAt: null,
                },
            }

            creditCardAccountData.synchronization.syncStatus = 'UPDATED'
            creditCardAccountData.synchronization.lastSyncAt = null
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
    
            const response = (await sut.perform(accountId)).value as CreditCardAccountData
    
            const updatedAccount = await accountRepository.findById(accountId)
            expect(updatedAccount.balance).toBe(balance)
            expect(updatedAccount.creditCardInfo).toEqual(creditCardAccountData.creditCardInfo)
            expect(updatedAccount.synchronization.syncStatus).toBe(providerAccountData1.synchronization.syncStatus)
            expect(updatedAccount.synchronization.lastSyncAt).toBe(creditCardAccountData.synchronization.lastSyncAt)
        })
    })

    describe('merge transactions', () => {
        
        test('should insert all transactions from data provider and update invoices', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance - 1000,
                imageUrl,
                userId: null,
                institution: {
                    id: null,
                    name: institution.name,
                    type: institution.type,
                    imageUrl: institution.imageUrl,
                    primaryColor: institution.primaryColor,
                    providerConnectorId: institution.providerConnectorId,
                },
                creditCardInfo: {
                    brand: 'visa',
                    creditLimit: 500000,
                    availableCreditLimit: 25000,
                    closeDay: 5,
                    dueDay: 12
                },
                providerAccountId,
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                    syncStatus: 'UPDATED',
                    lastSyncAt: null,
                },
            }

            const transaction0: TransactionRequest = {
                id: null,
                accountId: accountId,
                amount: -6789,
                descriptionOriginal: 'Compra online',
                date: new Date('2023-02-04'),
                providerId: 'valid-transaction-id0',
            }
            const transaction1: TransactionRequest = {
                id: null,
                accountId: accountId,
                amount: 1234,
                descriptionOriginal: 'pagamento recebido',
                date: new Date('2023-02-05'),
                providerId: 'valid-transaction-id1',
            }
            const transaction2: TransactionRequest = {
                id: null,
                accountId: accountId,
                amount: -9809,
                descriptionOriginal: 'outra compra',
                date: new Date('2023-02-06'),
                providerId: 'valid-transaction-id2',
            }

            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ], transactions: [transaction0, transaction1, transaction2]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const sut = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)

            const response = (await sut.perform(accountId)).value as CreditCardAccountData
            expect(transactionRepository.data).toHaveLength(3)
            expect(transactionRepository.data[0]).toEqual({
                id: '0',
                accountId: transaction0.accountId,
                accountType,
                syncType,
                amount: transaction0.amount,
                type: transaction0.amount >= 0 ? 'INCOME' : 'EXPENSE',
                descriptionOriginal: transaction0.descriptionOriginal,
                date: new Date('2023-02-12'),
                invoiceDate: transaction0.date,
                invoiceId: '0',
                userId,
                providerId: transaction0.providerId,
            })
            expect(transactionRepository.data[1]).toEqual({
                id: '1',
                accountId: transaction1.accountId,
                accountType,
                syncType,
                amount: transaction1.amount,
                type: transaction1.amount >= 0 ? 'INCOME' : 'EXPENSE',
                descriptionOriginal: transaction1.descriptionOriginal,
                date: new Date('2023-03-12'),
                invoiceDate: transaction1.date,
                invoiceId: '1',
                userId,
                providerId: transaction1.providerId,
            })
            expect(transactionRepository.data[2]).toEqual({
                id: '2',
                accountId: transaction2.accountId,
                accountType,
                syncType,
                amount: transaction2.amount,
                type: transaction2.amount >= 0 ? 'INCOME' : 'EXPENSE',
                descriptionOriginal: transaction2.descriptionOriginal,
                date: new Date('2023-03-12'),
                invoiceDate: transaction2.date,
                invoiceId: '1',
                userId,
                providerId: transaction2.providerId,
            })

            expect(invoiceRepository.data).toHaveLength(2)
            expect(invoiceRepository.data[0]).toEqual({
                id: "0", 
                accountId: "ac0", 
                amount: -6789, 
                closeDate: new Date('2023-02-05'), 
                dueDate: new Date('2023-02-12'), 
                userId: "u0",
                _isDeleted: false,
            })
            expect(invoiceRepository.data[1]).toEqual({
                id: "1", 
                accountId: "ac0", 
                amount: 1234 - 9809, 
                closeDate: new Date('2023-03-05'), 
                dueDate: new Date('2023-03-12'), 
                userId: "u0",
                _isDeleted: false,
            })
        })

    })
})