import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { UnregisteredInstitutionError, UnregisteredUserError } from "@/usecases/errors"
import { AccountData, BankAccountData, InstitutionData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create manual bank account use case', () => {
    test('should not create account if user is invalid', async () => {
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

        const createManualBankRequest: BankAccountData = {
            name,
            balance,
            userId,
            imageUrl,
            institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualBankRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not create account if name is invalid', async () => {
        const name = ''
        const balance = 0
        const imageUrl = 'valid image url'
        const userId = 'valid user id'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }


        const createManualBankRequest: BankAccountData = {
            name,
            balance,
            userId,
            imageUrl,
            institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })

    test('should not create account if balance is invalid', async () => {
        const name = 'valid account'
        const balance = 0.67
        const imageUrl = 'valid image url'
        const userId = 'valid user id'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }

        const createManualBankRequest: BankAccountData = {
            name,
            balance,
            userId,
            imageUrl,
            institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidBalanceError)
    })

    test('should not create account if institution is invalid', async () => {
        const name = 'valid account'
        const balance = 67
        const imageUrl = 'valid image url'
        const userId = 'valid user id'
        const institution: InstitutionData = {
            id: 'inexistent id',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }

        const createManualBankRequest: BankAccountData = {
            name,
            balance,
            userId,
            imageUrl,
            institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([])
        const sut = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualBankRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredInstitutionError)
    })

    test('should create account if all params are valid', async () => {
        const name = 'valid account'
        const balance = 670
        const imageUrl = 'valid image url'
        const userId = 'valid user id'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }

        const createManualBankRequest: BankAccountData = {
            name,
            balance,
            userId,
            imageUrl,
            institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualBankRequest)).value as AccountData

        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBeTruthy()
        expect(response.id).toBeDefined()
        expect(response.institution).toEqual(institution)
    })

    test('should create account with empty institution', async () => {
        const name = 'valid account'
        const balance = 670
        const imageUrl = 'valid image url'
        const userId = 'valid user id'
        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }

        const createManualBankRequest: BankAccountData = {
            name,
            balance,
            userId,
            imageUrl,
            // institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualBankRequest)).value as AccountData

        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBeTruthy()
        expect(response.id).toBeDefined()
        expect(response.institution).toBeUndefined()
    })
})