import { UserData, CategoryData, BankAccountData, CreditCardAccountData, UseCase, TransactionData } from "@/usecases/ports"
import { UpdateAutomaticTransaction } from "@/usecases/update-automatic-transaction"
import { UpdateAutomaticTransactionController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryUserRepository, InMemoryAccountRepository, InMemoryTransactionRepository, InMemoryCategoryRepository, InMemoryCreditCardInvoiceRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Update automatic transaction web controller', () => {
    const transactionId = 'valid id'
    const userId = 'u0'
    const categoryId = 'c0'
    const amount = -5060
    const description = 'valid description'
    const descriptionOriginal = 'valid original description'
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

    const categoryData1: CategoryData = {
        name: "category 1",
        group: "group 1",
        iconName: "icon 1",
        primaryColor: "color 1",
        ignored: true,
        id: "c1",
    }

    const bankAccountId = 'bac0'
    const bankAccountType = 'BANK'
    const creditCardAccountId = 'cca0'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'AUTOMATIC'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000

    let bankAccountData: BankAccountData
    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        bankAccountData = {
            id: bankAccountId,
            type: bankAccountType,
            syncType,
            name: 'valid bank account',
            balance,
            imageUrl,
            userId,
        }

        creditCardAccountData = {
            id: creditCardAccountId,
            type: creditCardAccountType,
            syncType,
            name: 'valid credit card account',
            balance,
            imageUrl,
            userId,
            creditCardInfo: {
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: availableCreditLimit,
                closeDay: 3,
                dueDay: 10
            }
        }
    })

    test('should return status code 400 bad request when request is missing required params', async () => {
        const invalidRequest: HttpRequest = {
            body: {
            }
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const usecase = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const sut = new UpdateAutomaticTransactionController(usecase)
        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect(response.body.message).toBe("Missing parameters from request: id.")
    })

    test('should return status code 500 when server raises', async () => {
        const validRequest: HttpRequest = {
            body: {
                id: transactionId,
                categoryId,
                description: 'new description',
                comment: 'new comment',
                ignored: true,
            }
        }

        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new UpdateAutomaticTransactionController(errorThrowingUseCaseStub)
        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })

    describe('update automatic transaction from bank account', () => {
        test('should return status code 200 ok when request is valid', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: bankAccountId,
                accountType: bankAccountType,
                syncType,
                userId,
                description,
                descriptionOriginal,
                amount,
                date,
                type: 'INCOME',
                category: categoryData1,
            }

            const validRequest: HttpRequest = {
                body: {
                    id: transactionId,
                    categoryId,
                    description: 'new description',
                    comment: 'new comment',
                    ignored: true,
                }
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const usecase = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
            const sut = new UpdateAutomaticTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body.id).toBeTruthy()
        })
    })

    describe('update automatic transaction from credit card account', () => {
        test('should return status code 200 ok when request is valid', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description,
                descriptionOriginal,
                amount,
                date,
                type: 'INCOME',
                category: categoryData1,
            }

            const validRequest: HttpRequest = {
                body: {
                    id: transactionId,
                    categoryId,
                    description: 'new description',
                    comment: 'new comment',
                    ignored: true,
                }
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const usecase = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
            const sut = new UpdateAutomaticTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body.id).toBeTruthy()
        })
    })
})