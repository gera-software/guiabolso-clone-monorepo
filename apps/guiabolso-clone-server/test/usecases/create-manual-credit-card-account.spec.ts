import { InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"
import { CreateManualCreditCardAccount } from "@/usecases/create-manual-credit-card-account"
import { UnregisteredInstitutionError, UnregisteredUserError } from "@/usecases/errors"
import { AccountData, CreditCardAccountData, CreditCardInfoData, InstitutionData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create manual credit card account use case', () => {
    test('should not create account if user is invalid', async () => {
        const type = 'CREDIT_CARD'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }

        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not create account if credit card info is invalid', async () => {
        const type = 'CREDIT_CARD'
        const name = 'valid account'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 32,
            dueDay: 0
        }


        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidCreditCardError)
    })

    test('should not create account if name is invalid', async () => {
        const type = 'CREDIT_CARD'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }


        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })

    test('should not create account if balance is invalid', async () => {
        const type = 'CREDIT_CARD'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }

        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidBalanceError)
    })

    test('should not create account if institution is invalid', async () => {
        const type = 'CREDIT_CARD'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }

        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredInstitutionError)
    })

    test('should create account if all params are valid', async () => {
        const type = 'CREDIT_CARD'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }

        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as AccountData

        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBeTruthy()
        expect(response.id).toBeTruthy()
        expect(response.institution).toEqual(institution)
        expect(response.creditCardInfo).toEqual(creditCardInfo)
    })

    test('should create account with empty institution', async () => {
        const type = 'CREDIT_CARD'
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
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }

        const createManualCreditCardRequest: CreditCardAccountData = {
            type,
            name,
            balance,
            userId,
            imageUrl,
            creditCardInfo,
            // institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createManualCreditCardRequest)).value as AccountData

        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBeTruthy()
        expect(response.id).toBeTruthy()
        expect(response.institution).toBeFalsy()
        expect(response.creditCardInfo).toEqual(creditCardInfo)
    })
})