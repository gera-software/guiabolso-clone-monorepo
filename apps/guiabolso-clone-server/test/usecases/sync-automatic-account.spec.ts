import { DataProviderError, UnregisteredAccountError } from "@/usecases/errors"
import { BankAccountData, CreditCardAccountData, InstitutionData, UserData } from "@/usecases/ports"
import { SyncAutomaticAccount } from "@/usecases/sync-automatic-account"
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account"
import { SyncAutomaticCreditCardAccount } from "@/usecases/sync-automatic-credit-card-account"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryInstitutionRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Sync automatic account use case', () => {
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
    
    const bankAccountId = 'ac0'
    const bankAccountType = 'BANK'
    const bankBalance = 678
    const providerBankAccountId = 'valid-provider-account-id'
    const bankSynchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
    }
    
    const creditAccountId = 'ac1'
    const creditAccountType = 'CREDIT_CARD'
    const creditBalance = 678
    const providerCreditAccountId = 'valid-provider-account-id'
    const availableCreditLimit = 100000
    const creditSynchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
    }


    const syncType = 'AUTOMATIC'
    const name = 'valid account'
    const imageUrl = 'valid image url'

    
    let bankAccountData: BankAccountData

    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        bankAccountData = {
            id: bankAccountId,
            type: bankAccountType,
            syncType,
            name,
            balance: bankBalance,
            imageUrl,
            userId,
            providerAccountId: providerBankAccountId,
            synchronization: bankSynchronization,
        }

        creditCardAccountData = {
            id: creditAccountId,
            type: creditAccountType,
            syncType,
            name,
            balance: creditBalance,
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
            providerAccountId: providerCreditAccountId,
            synchronization: creditSynchronization,
        }
    })

    describe('sync bank account', () => {
        test('should not sync if account does not exists', async () => {
            const accountId = 'invalid-bank-account-id'
    
            const dataProvider = new InMemoryPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)

            const response = (await sut.perform(accountId)).value as Error
            expect(response).toBeInstanceOf(UnregisteredAccountError)
        })

        test('should not sync if data provided has an error', async () => {
            const dataProvider = new ErrorPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([bankAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)

            const response = (await sut.perform(bankAccountId)).value as Error
            expect(response).toBeInstanceOf(DataProviderError)
        })

        test('should sync if account is valid', async () => {
            const providerAccountData1: BankAccountData = {
                id: null,
                type: bankAccountType,
                syncType,
                name,
                balance: bankBalance + 1000,
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
                providerAccountId: providerBankAccountId,
                synchronization: bankSynchronization,
            }
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([bankAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)

            const response = (await sut.perform(bankAccountId)).value as BankAccountData
            expect(response.balance).toBe(providerAccountData1.balance)
            expect(response.synchronization.lastSyncAt).toBeInstanceOf(Date)
        })
    })

    describe('sync credit card account', () => {
        test('should not sync if account does not exists', async () => {
            const accountId = 'invalid-account-id'

            const dataProvider = new InMemoryPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)
    
            const response = (await sut.perform(accountId)).value as Error
            expect(response).toBeInstanceOf(UnregisteredAccountError)
        })

        test('should not sync if data provided has an error', async () => {
            const dataProvider = new ErrorPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)
    
            const response = (await sut.perform(creditAccountId)).value as Error
            expect(response).toBeInstanceOf(DataProviderError)
        })

        test('should update account balance, credit card info and synchronization status', async () => {
            const providerAccountData1: CreditCardAccountData = {
                id: null,
                type: creditAccountType,
                syncType,
                name,
                balance: creditBalance - 1000,
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
                providerAccountId: providerCreditAccountId,
                synchronization: creditSynchronization,
            }
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)
    
            const response = (await sut.perform(creditAccountId)).value as CreditCardAccountData
            expect(response.balance).toBe(providerAccountData1.balance)
            expect(response.synchronization.lastSyncAt).toBeInstanceOf(Date)
    
            const updatedAccount = await accountRepository.findById(creditAccountId)
            expect(updatedAccount.balance).toBe(providerAccountData1.balance)
            expect(updatedAccount.synchronization.lastSyncAt).toBeInstanceOf(Date)
            expect(updatedAccount.creditCardInfo).toEqual(providerAccountData1.creditCardInfo)
        })
    })


})