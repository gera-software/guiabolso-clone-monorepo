import { AddManualTransaction } from "@/usecases/add-manual-transaction"
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet"
import { CategoryData, UseCase, WalletAccountData } from "@/usecases/ports"
import { AddManualTransactionController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Add manual transaction web controller', () => {
    const userId = 'u0'
    const categoryId = 'c0'
    const amount = -5060
    const description = 'valid description'
    const date = new Date('2023-03-09')
    const comment = 'valid comment'
    const ignored = false

    const categoryData: CategoryData = {
        name: "category 0",
        group: "group 0",
        iconName: "icon 0",
        primaryColor: "color 0",
        ignored: true,
        id: categoryId,
    }
    
    
    const accountId = 'ac0'
    const accountType = 'WALLET'
    const syncType = 'MANUAL'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'

    let walletAccountData: WalletAccountData

    beforeEach(() => {
        walletAccountData = {
            id: accountId,
            type: accountType,
            syncType,
            name,
            balance,
            imageUrl,
            userId,
        }
    })

    describe('Add manual transaction to wallet account', () => {

        test('should return status code 400 bad request when request is missing required params', async () => {
    
            const invalidRequest: HttpRequest = {
                body: {
                }
            }
    
            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(userRepository, accountRepository, transactionRepository, categoryRepository)
            
            const usecase = new AddManualTransaction(addManualTransactionToWallet)
    
            const sut = new AddManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(invalidRequest)
            expect(response.statusCode).toEqual(400)
            expect(response.body as Error).toBeInstanceOf(MissingParamError)
            expect(response.body.message).toBe("Missing parameters from request: accountId, categoryId, amount, date, description.")
        })

        test('should return status code 201 created when request is valid', async () => {
            const validRequest: HttpRequest = {
                body: {
                    accountId, 
                    categoryId, 
                    amount, 
                    date,
                    description,
                    comment,
                    ignored,
                }
            }
    
            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(userRepository, accountRepository, transactionRepository, categoryRepository)
            
            const usecase = new AddManualTransaction(addManualTransactionToWallet)
    
            const sut = new AddManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(201)
            expect(response.body.id).toBeTruthy()

        })

        test('should return status code 500 when server raises', async () => {
            const validRequest: HttpRequest = {
                body: {
                    accountId, 
                    categoryId, 
                    amount, 
                    date,
                    description,
                    comment,
                    ignored,
                }
            }

            const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
            const sut = new AddManualTransactionController(errorThrowingUseCaseStub)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(500)

        })
    })
})