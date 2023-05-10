import { InvalidAccountError } from "@/entities/errors"
import { UnexpectedError, UnregisteredAccountError } from "@/usecases/errors"
import { CreditCardAccountData, InstitutionData, UserData } from "@/usecases/ports"
import { SyncAutomaticCreditCardAccount } from "@/usecases/sync-automatic-credit-card-account"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository } from "@test/doubles/repositories"

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
            providerAccountId,
            synchronization,
        }
    })

    test('should not sync if account does not exists', async () => {
        const accountId = 'invalid-bank-account-id'

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([])
        const sut = new SyncAutomaticCreditCardAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not sync if account does not have a provider account id or item id', async () => {
        delete creditCardAccountData.providerAccountId
        delete creditCardAccountData.synchronization

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const sut = new SyncAutomaticCreditCardAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not sync if data provided has an error', async () => {
        const dataProvider = new ErrorPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const sut = new SyncAutomaticCreditCardAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnexpectedError)
    })

    test('should not sync if data provider item does not have the requested account', async () => {
        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const sut = new SyncAutomaticCreditCardAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as Error
        expect(response).toBeInstanceOf(UnexpectedError)
    })

    test('should update account balance and synchronization status', async () => {
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
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: availableCreditLimit,
                closeDay: 3,
                dueDay: 10
            },
            providerAccountId,
            synchronization,
        }

        const dataProvider = new InMemoryPluggyDataProvider({accounts: [ providerAccountData1 ]})
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const sut = new SyncAutomaticCreditCardAccount(accountRepository, dataProvider)

        const response = (await sut.perform(accountId)).value as CreditCardAccountData
        expect(response.balance).toBe(providerAccountData1.balance)
        expect(response.synchronization.lastSyncAt).toBeInstanceOf(Date)

        const updatedAccount = await accountRepository.findById(accountId)
        expect(updatedAccount.balance).toBe(providerAccountData1.balance)
        expect(updatedAccount.synchronization.lastSyncAt).toBeInstanceOf(Date)

        // TODO credit card info
    })
})