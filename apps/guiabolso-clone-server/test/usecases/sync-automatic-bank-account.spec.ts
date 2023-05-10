import { InvalidAccountError } from "@/entities/errors"
import { UnexpectedError, UnregisteredAccountError } from "@/usecases/errors"
import { BankAccountData, InstitutionData, UserData } from "@/usecases/ports"
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository } from "@test/doubles/repositories"

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
        const sut = new SyncAutomaticBankAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not sync if account does not have a provider account id or item id', async () => {
        delete bankAccountData.providerAccountId
        delete bankAccountData.synchronization

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const sut = new SyncAutomaticBankAccount(accountRepository, dataProvider)
        
        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not sync if data provided has an error', async () => {
        const dataProvider = new ErrorPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const sut = new SyncAutomaticBankAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnexpectedError)
    })

    test('should not sync if data provider item does not have the requested account', async () => {
        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const sut = new SyncAutomaticBankAccount(accountRepository, dataProvider)
        
        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnexpectedError)
    })

    test('should update account balance', async () => {
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
        const sut = new SyncAutomaticBankAccount(accountRepository, dataProvider)
        
        const response = (await sut.perform(accountId)).value as BankAccountData

        const updatedAccount = await accountRepository.findById(accountId)
        expect(updatedAccount.balance).toBe(providerAccountData1.balance)
    })
})