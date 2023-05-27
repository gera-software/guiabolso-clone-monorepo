import { DataProviderError, UnregisteredAccountError } from "@/usecases/errors"
import { BankAccountData, InstitutionData, UserData } from "@/usecases/ports"
import { SyncAutomaticAccount } from "@/usecases/sync-automatic-account"
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryTransactionRepository } from "@test/doubles/repositories"

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
    const syncType = 'AUTOMATIC'
    const name = 'valid account'
    const bankBalance = 678
    const imageUrl = 'valid image url'
    const providerBankAccountId = 'valid-provider-account-id'
    const bankSynchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
    }
    
    let bankAccountData: BankAccountData

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
    })

    describe('sync bank account', () => {
        test('should not sync if account does not exists', async () => {
            const accountId = 'invalid-bank-account-id'
    
            const dataProvider = new InMemoryPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([])
            const transactionRepository = new InMemoryTransactionRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount)

            const response = (await sut.perform(accountId)).value as Error
            expect(response).toBeInstanceOf(UnregisteredAccountError)
        })

        
        test('should not sync if data provided has an error', async () => {
            const dataProvider = new ErrorPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount)

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
            const transactionRepository = new InMemoryTransactionRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const sut = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount)

            const response = (await sut.perform(bankAccountId)).value as BankAccountData
            expect(response.balance).toBe(providerAccountData1.balance)
            expect(response.synchronization.lastSyncAt).toBeInstanceOf(Date)
        })
    })


})