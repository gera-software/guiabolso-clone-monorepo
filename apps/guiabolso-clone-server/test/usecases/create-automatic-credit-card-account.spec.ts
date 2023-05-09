import { InvalidAccountError, InvalidBalanceError, InvalidCreditCardError, InvalidInstitutionError, InvalidNameError } from "@/entities/errors"
import { CreateAutomaticCreditCardAccount } from "@/usecases/create-automatic-credit-card-account"
import { UnregisteredInstitutionError, UnregisteredUserError } from "@/usecases/errors"
import { AccountData, CreditCardAccountData, CreditCardInfoData, InstitutionData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create automatic credit card account use case', () => {
    test('should not create account if user is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid account'
        const balance = -245
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not create account if credit card info is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid account'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidCreditCardError)
    })

    test('should not create account if name is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = ''
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })

    test('should not create account if balance is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -0.245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidBalanceError)
    })

    test('should not create account if institution is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
        const institution: InstitutionData = {
            id: 'invalid id',
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredInstitutionError)
    })

    test('should not create account without institution', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
        const institution: InstitutionData = null
        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidInstitutionError)
    })

    test('should not create account if providerAccountId is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = ''
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not create account if providerItemId is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = ''
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should not create account if createdAt is invalid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt: Date = null

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
    })

    test('should create account if all params are valid', async () => {
        const type = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const name = 'valid name'
        const balance = -245
        const imageUrl = 'valid image url'
        const userId = 'valid user'
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
        const providerAccountId = 'valid-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const createAutomaticCreditCardRequest: CreditCardAccountData = {
            type,
            syncType,
            name,
            balance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const sut = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        const response = (await sut.perform(createAutomaticCreditCardRequest)).value as AccountData
        expect(response.id).toBeTruthy()

        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBeTruthy()
    })
})