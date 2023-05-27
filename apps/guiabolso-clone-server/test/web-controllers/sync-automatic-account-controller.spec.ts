import { UserData, InstitutionData, BankAccountData, CreditCardAccountData, UseCase } from "@/usecases/ports"
import { SyncAutomaticAccount } from "@/usecases/sync-automatic-account"
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account"
import { SyncAutomaticCreditCardAccount } from "@/usecases/sync-automatic-credit-card-account"
import { SyncAutomaticAccountController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { ErrorPluggyDataProvider, InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository, InMemoryTransactionRepository, InMemoryCreditCardInvoiceRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Sync automatic account web controller', () => {
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
    const bankBalance = 678
    const providerBankAccountId = 'valid-provider-account-id'
    const bankSynchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
    }
    
    const creditAccountId = 'ac1'
    const creditAccountType = 'CREDIT_CARD'
    const creditBalance = 678
    const providerCreditAccountId = 'valid-provider-account-id'
    const availableCreditLimit = 100000
    const creditSynchronization = {
        providerItemId: 'valid-provider-item-id',
        createdAt: new Date(),
    }


    const syncType = 'AUTOMATIC'
    const name = 'valid account'
    const imageUrl = 'valid image url'

    
    let bankAccountData: BankAccountData

    let creditCardAccountData: CreditCardAccountData

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

        creditCardAccountData = {
            id: creditAccountId,
            type: creditAccountType,
            syncType,
            name,
            balance: creditBalance,
            imageUrl,
            userId,
            creditCardInfo: {
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: availableCreditLimit,
                closeDay: 3,
                dueDay: 10
            },
            institution,
            providerAccountId: providerCreditAccountId,
            synchronization: creditSynchronization,
        }
    })

    test('should return status code 400 bad request when request is missing required params', async () => {
        const invalidRequest: HttpRequest = {
            body: {
            }
        }

        const dataProvider = new InMemoryPluggyDataProvider({})
        const accountRepository = new InMemoryAccountRepository([])
        const institutionRepository = new InMemoryInstitutionRepository([institution])
        const userRepository = new InMemoryUserRepository([userData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
        const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
        const usecase = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)

        const sut = new SyncAutomaticAccountController(usecase)
        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect(response.body.message).toBe("Missing parameters from request: accountId.")
    })

    test('should return status code 500 when server raises', async () => {
        const validRequest: HttpRequest = {
            body: {
                accountId: 'valid-account-id'
            }
        }
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new SyncAutomaticAccountController(errorThrowingUseCaseStub)
        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })

    describe('sync bank account', () => {

        test('should return status 500 when data provider has an error', async () => {
            const dataProvider = new ErrorPluggyDataProvider({})
            const accountRepository = new InMemoryAccountRepository([bankAccountData])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const userRepository = new InMemoryUserRepository([userData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
            const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
            const usecase = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)

            const sut = new SyncAutomaticAccountController(usecase)
            
            const validRequest: HttpRequest = {
                body: {
                    accountId: bankAccountData.id
                }
            }
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(500)
        })

    })
})