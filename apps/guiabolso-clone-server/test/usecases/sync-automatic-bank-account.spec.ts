import { InvalidAccountError } from "@/entities/errors"
import { DataProviderError, UnexpectedError, UnregisteredAccountError } from "@/usecases/errors"
import { BankAccountData, InstitutionData, TransactionRequest, UserData } from "@/usecases/ports"
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryTransactionRepository } from "@test/doubles/repositories"

describe('Sync automatic bank account use case', () => {
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
    const accountType = 'BANK'
    const syncType = 'AUTOMATIC'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'
    const providerAccountId = 'valid-provider-account-id'
    const synchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
    }
    
    let bankAccountData: BankAccountData

    beforeEach(() => {
        bankAccountData = {
            id: accountId,
            type: accountType,
            syncType,
            name,
            balance,
            imageUrl,
            userId,
            providerAccountId,
            synchronization,
        }
    })

    test('should not sync if account does not exists', async () => {
        const accountId = 'invalid-bank-account-id'

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not sync if account does not have a provider account id or item id', async () => {
        delete bankAccountData.providerAccountId
        delete bankAccountData.synchronization

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
        
        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not sync if data provided has an error', async () => {
        const dataProvider = new ErrorPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(DataProviderError)
    })

    test('should not sync if data provider item does not have the requested account', async () => {
        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
        
        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnexpectedError)
    })

    test('should update account balance and synchronization status', async () => {
        const providerAccountData1: BankAccountData = {
            id: null,
            type: accountType,
            syncType,
            name,
            balance: balance + 1000,
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
            providerAccountId,
            synchronization,
        }

        const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
        
        const response = (await sut.perform(accountId)).value as BankAccountData
        expect(response.balance).toBe(providerAccountData1.balance)
        expect(response.synchronization.lastSyncAt).toBeInstanceOf(Date)

        const updatedAccount = await accountRepository.findById(accountId)
        expect(updatedAccount.balance).toBe(providerAccountData1.balance)
        expect(updatedAccount.synchronization.lastSyncAt).toBeInstanceOf(Date)
    })

    describe('merge transactions', () => {

        test('should insert all transactions from data provided', async () => {
            const providerAccountData1: BankAccountData = {
                id: null,
                type: accountType,
                syncType,
                name,
                balance: balance + 1000,
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
                providerAccountId,
                synchronization,
            }
    
            const transaction0: TransactionRequest = {
                id: null,
                accountId: accountId,
                amount: -6789,
                descriptionOriginal: 'Compra online',
                date: new Date(),
                providerId: 'valid-transaction-id0',
            }
            const transaction1: TransactionRequest = {
                id: null,
                accountId: accountId,
                amount: 1234,
                descriptionOriginal: 'Transferencia recebida',
                date: new Date(),
                providerId: 'valid-transaction-id1',
            }
    
            const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ], transactions: [transaction0, transaction1] })
            const accountRepository = new InMemoryAccountRepository([bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const sut = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
    
            const response = (await sut.perform(accountId)).value as BankAccountData
    
            expect(transactionRepository.data).toHaveLength(2)
            expect(transactionRepository.data[0]).toEqual({
                id: '0',
                accountId: transaction0.accountId,
                accountType,
                syncType,
                amount: transaction0.amount,
                type: transaction0.amount >= 0 ? 'INCOME' : 'EXPENSE',
                descriptionOriginal: transaction0.descriptionOriginal,
                date: transaction0.date,
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
                date: transaction1.date,
                userId,
                providerId: transaction1.providerId,
            })
        })
    })

})