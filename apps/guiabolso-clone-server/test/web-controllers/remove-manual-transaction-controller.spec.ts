import { CategoryData, TransactionData, UseCase, WalletAccountData } from "@/usecases/ports"
import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction"
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet"
import { RemoveManualTransactionController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryAccountRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Remove manual transaction web controller', () => {
    const userId = 'u0'
    const categoryId = 'c0'
    const amount = -5060
    const type = 'EXPENSE'
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

    describe('Remove manual transaction from wallet account', () => {
        test('should return status code 400 bad request when request is missing required params', async () => {
            const invalidRequest: HttpRequest = {
                body: {
                }
            }
            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            
            const usecase = new RemoveManualTransaction(removeManualTransactionFromWallet)

            const sut = new RemoveManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(invalidRequest)
            expect(response.statusCode).toEqual(400)
            expect(response.body as Error).toBeInstanceOf(MissingParamError)
            expect(response.body.message).toBe("Missing parameters from request: id.")

        })

        test('should return status code 200 ok when request is valid', async () => {
            const id = 'valid id'
            const transactionData: TransactionData = {
                id, 
                accountId,
                accountType,
                syncType,
                userId,
                amount: -5678,
                date,
                type: 'EXPENSE',
                description,
                comment,
                ignored,
                _isDeleted: false,
            }

            const validRequest: HttpRequest = {
                body: {
                    id
                }
            }

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            
            const usecase = new RemoveManualTransaction(removeManualTransactionFromWallet)

            const sut = new RemoveManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body._isDeleted).toEqual(true)
        })

        test('should return status code 500 when server raises', async () => {
            const id = 'valid id'

            const validRequest: HttpRequest = {
                body: {
                    id
                }
            }

            const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
            const sut = new RemoveManualTransactionController(errorThrowingUseCaseStub)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(500)
        })
    })
})