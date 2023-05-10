import { ConnectAutomaticAccounts } from "@/usecases/connect-automatic-accounts"
import { CreateAutomaticBankAccount } from "@/usecases/create-automatic-bank-account"
import { CreateAutomaticCreditCardAccount } from "@/usecases/create-automatic-credit-card-account"
import { DataProviderError } from "@/usecases/errors"
import { AccountData, BankAccountData, CategoryData, CreditCardAccountData, CreditCardInfoData, InstitutionData, UserData } from "@/usecases/ports"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Connect automatic accounts use case', () => {
    test('should not create accounts when the data provider has an error', async () => {
        const validItemId = 'valid-item-id'
        const userId = 'u0'

        const userData: UserData = {
            id: userId, 
            name: 'any name', 
            email: 'any@email.com', 
            password: '123'
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([userData])
        const institutionRepository = new InMemoryInstitutionRepository([])

        const financialDataProvider = new ErrorPluggyDataProvider({ institutions: [], accounts: [] })
        const createAutomaticBankAccount = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const createAutomaticCreditCardAccount = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        
        const sut = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)

        const connectRequest = {
            itemId: validItemId,
            userId: userId,
        }

        const response = (await sut.perform(connectRequest)).value as Error
        expect(response).toBeInstanceOf(DataProviderError)
    })

    test('should create all accounts linked to an item in data provider', async () => {
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
            synchronization: {
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
            userId: null,
            imageUrl,
            institution: {
                id: null,
                name: institution.name,
                type: institution.type,
                imageUrl: institution.imageUrl,
                primaryColor: institution.primaryColor,
                providerConnectorId: institution.providerConnectorId,
            },
            creditCardInfo,
            providerAccountId: providerCreditCardAccountId,
            synchronization: {
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
        
        const sut = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)

        const connectRequest = {
            itemId: validItemId,
            userId: userId,
        }

        const response = (await sut.perform(connectRequest)).value as AccountData[]
        expect(response.length).toBe(2)
        expect(response[0].institution).toEqual(institution)

        const addedAccounts = accountRepository.data
        expect(addedAccounts.length).toBe(2)



    })
    
    test("should create account and upsert institution", async () => {
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

        const institution1: InstitutionData = {
            id: null,
            name: 'institution 1',
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
            name: creditCardName,
            balance: creditCardBalance,
            imageUrl,
            userId: null,
            institution: institution1,
            providerAccountId: providerBankAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountData2: CreditCardAccountData = {
            id: null,
            type: creditCardAccountType,
            syncType,
            name: bankName,
            balance: bankBalance,
            userId: null,
            imageUrl,
            institution: institution1,
            creditCardInfo,
            providerAccountId: providerCreditCardAccountId,
            synchronization: {
                providerItemId,
                createdAt,
            },
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([userData])
        const institutionRepository = new InMemoryInstitutionRepository([])

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [ institution1 ], accounts: [ accountData1, accountData2 ] })
        const createAutomaticBankAccount = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
        const createAutomaticCreditCardAccount = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)
        
        const sut = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)

        const connectRequest = {
            itemId: validItemId,
            userId: userId,
        }

        const response = (await sut.perform(connectRequest)).value as AccountData[]
        expect(response.length).toBe(2)


        const institutions = institutionRepository.data
        expect(institutions.length).toBe(1)
        expect(institutions[0].id).toBeDefined()
        expect(response[0].institution).toEqual(institutions[0])

    })

})