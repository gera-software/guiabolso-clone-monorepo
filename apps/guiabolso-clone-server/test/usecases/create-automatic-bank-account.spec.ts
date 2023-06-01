import { MergeStatus, ProviderSyncStatus } from "@/entities"
import { InvalidAccountError, InvalidBalanceError, InvalidInstitutionError, InvalidNameError } from "@/entities/errors"
import { CreateAutomaticBankAccount } from "@/usecases/create-automatic-bank-account"
import { UnregisteredInstitutionError, UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, InstitutionData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create automatic bank account use case', () => {
    test('should not create account if user is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid account'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not create account if name is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = ''
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })

    test('should not create account if balance is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 0.245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidBalanceError)
    })

    test('should not create account if institution is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'inexistent id',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredInstitutionError)
    })

    test('should not create account without institution', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = null
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidInstitutionError)
    })

    test('should not create account if providerAccountId is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = ''
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not create account if providerItemId is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = ''
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not create account if createdAt is invalid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt: Date = null
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should create account if all params are valid', async () => {
        const type = 'BANK'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()
        const syncStatus: ProviderSyncStatus = 'UPDATED'
        const lastSyncAt = new Date()
        const lastMergeAt = new Date()
        const mergeStatus: MergeStatus = 'MERGED'

        const createAutomaticBankRequest: BankAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
                syncStatus,
                lastSyncAt,
                lastMergeAt,
                mergeStatus,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticBankRequest)).value as BankAccountData
        expect(response.id).toBeTruthy()
        expect(response.syncType).toBe('AUTOMATIC')
        expect(response.type).toBe('BANK')
        expect(response.synchronization).toEqual(createAutomaticBankRequest.synchronization)


        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBe(true)
    })
})