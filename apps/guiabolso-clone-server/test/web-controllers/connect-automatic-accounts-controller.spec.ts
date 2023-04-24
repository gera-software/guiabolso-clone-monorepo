import { ConnectAutomaticAccounts } from "@/usecases/connect-automatic-accounts"
import { CreateAutomaticBankAccount } from "@/usecases/create-automatic-bank-account"
import { CreateAutomaticCreditCardAccount } from "@/usecases/create-automatic-credit-card-account"
import { UnexpectedError } from "@/usecases/errors"
import { BankAccountData, CategoryData, CreditCardAccountData, CreditCardInfoData, InstitutionData, UseCase, UserData } from "@/usecases/ports"
import { ConnectAutomaticAccountsController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpResponse } from "@/web-controllers/ports"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Connect automatic accounts web controller', () => {
    test('should return status code 400 bad request when request is missing required params', async () => {
        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([])

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [], accounts: [] })
        const createAutomaticBankAccount = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const createAutomaticCreditCardAccount = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)

        const usecase = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)
        const sut = new ConnectAutomaticAccountsController(usecase)

        const invalidRequest = {
            body: {
                // itemId: validItemId,
                // userId: validUserId,
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect(response.body.message).toBe("Missing parameters from request: itemId, userId.")

    })

    test('should return status code 500 when data provider has an error', async () => {
        const validItemId = 'valid-item-id'
        const validUserId = 'valid-user-id'

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([])

        const financialDataProvider = new ErrorPluggyDataProvider({ institutions: [], accounts: [] })
        const createAutomaticBankAccount = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const createAutomaticCreditCardAccount = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)

        const usecase = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)
        const sut = new ConnectAutomaticAccountsController(usecase)


        const validRequest = {
            body: {
                itemId: validItemId,
                userId: validUserId,
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
        expect(response.body as Error).toBeInstanceOf(UnexpectedError)
        expect(response.body.message).toBe("erro inesperado")
    })

    test('should return status 201 created when request is valid and provider has data', async () => {
        const validItemId = 'valid-item-id'

        const userId = 'u0'
        const categoryId = 'c0'
        const amount = -5060
        const description = 'valid description'
        const date = new Date('2023-03-09')
        const comment = 'valid comment'
        const ignored = false
    
        const userData: UserData = {
            id: userId, 
            name: 'any name', 
            email: 'any@email.com', 
            password: '123'
        }
    
        const categoryData: CategoryData = {
            name: "category 0",
            group: "group 0",
            iconName: "icon 0",
            primaryColor: "color 0",
            ignored: true,
            id: categoryId,
        }
        
        const bankAccountId = 'b0'
        const bankAccountType = 'BANK'
        const creditCardAccountId = 'cc1'
        const creditCardAccountType = 'CREDIT_CARD'
        const syncType = 'AUTOMATIC'
        const bankName = 'automatic bank account'
        const bankBalance = 678
        const creditCardName = 'automatic credit card account'
        const creditCardBalance = -400
        const imageUrl = 'valid image url'

        const institution: InstitutionData = {
            id: 'id 0',
            name: 'institution name',
            type: 'PERSONAL_BANK',
            imageUrl: 'url',
            primaryColor: 'color',
            providerConnectorId: 'valid id'
        }
        const providerBankAccountId = 'valid-bank-account-id'
        const providerCreditCardAccountId = 'valid-credit-card-account-id'
        const providerItemId = 'valid-item-id'
        const createdAt = new Date()

        const creditCardInfo: CreditCardInfoData = {
            brand: "master card",
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10
        }

        const accountData1: BankAccountData = {
            id: null,
            type: bankAccountType,
            syncType,
            name: bankName,
            balance: bankBalance,
            imageUrl,
            userId,
            institution,
            providerAccountId: providerBankAccountId,
            synchonization: {
                providerItemId,
                createdAt,
            },
        }

        const accountData2: CreditCardAccountData = {
            id: null,
            type: creditCardAccountType,
            syncType,
            name: creditCardName,
            balance: creditCardBalance,
            userId,
            imageUrl,
            institution,
            creditCardInfo,
            providerAccountId: providerCreditCardAccountId,
            synchonization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([userData])
        const institutionRepository = new InMemoryInstitutionRepository([institution])

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [], accounts: [ accountData1, accountData2 ] })
        const createAutomaticBankAccount = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const createAutomaticCreditCardAccount = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)

        const usecase = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)
        const sut = new ConnectAutomaticAccountsController(usecase)


        const validRequest = {
            body: {
                itemId: validItemId,
                userId: userId,
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(201)
        expect(response.body.length).toBe(2)

    })

    test('should return status code 500 when server raises', async () => {
        const validItemId = 'valid-item-id'
        const validUserId = 'valid-user-id'

        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new ConnectAutomaticAccountsController(errorThrowingUseCaseStub)

        const validRequest = {
            body: {
                itemId: validItemId,
                userId: validUserId,
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })
})