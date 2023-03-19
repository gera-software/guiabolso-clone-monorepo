import { AddManualTransaction } from "@/usecases/add-manual-transaction"
import { AddManualTransactionToBank } from "@/usecases/add-manual-transaction-to-bank"
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet"
import { BankAccountData, CategoryData, UseCase, UserData, WalletAccountData } from "@/usecases/ports"
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
    
    
    const walletAccountId = 'wac0'
    const walletAccountType = 'WALLET'
    const bankAccountId = 'bac0'
    const bankAccountType = 'BANK'
    const syncType = 'MANUAL'
    const balance = 678
    const imageUrl = 'valid image url'

    let walletAccountData: WalletAccountData
    let bankAccountData: BankAccountData

    beforeEach(() => {
        walletAccountData = {
            id: walletAccountId,
            type: walletAccountType,
            syncType,
            name: 'valid wallet account',
            balance,
            imageUrl,
            userId,
        }

        bankAccountData = {
            id: bankAccountId,
            type: bankAccountType,
            syncType,
            name: 'valid wallet account',
            balance,
            imageUrl,
            userId,
        }
    })

    test('should return status code 400 bad request when request is missing required params', async () => {
    
        const invalidRequest: HttpRequest = {
            body: {
            }
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
        const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
        
        const usecase = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)

        const sut = new AddManualTransactionController(usecase)
        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect(response.body.message).toBe("Missing parameters from request: accountId, amount, date, description.")
    })

    test('should return status code 500 when server raises', async () => {
        const validRequest: HttpRequest = {
            body: {
                accountId: walletAccountId, 
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

    describe('Add manual transaction to wallet account', () => {

        test('should return status code 201 created when request is valid', async () => {
            const validRequest: HttpRequest = {
                body: {
                    accountId: walletAccountId, 
                    categoryId, 
                    amount, 
                    date,
                    description,
                    comment,
                    ignored,
                }
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const usecase = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)    
    
            const sut = new AddManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(201)
            expect(response.body.id).toBeTruthy()

        })

    })

    describe('Add manual transaction to bank account', () => {

        test('should return status code 201 created when request is valid', async () => {
            const validRequest: HttpRequest = {
                body: {
                    accountId: bankAccountId, 
                    categoryId, 
                    amount, 
                    date,
                    description,
                    comment,
                    ignored,
                }
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const usecase = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)    
    
            const sut = new AddManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(201)
            expect(response.body.id).toBeTruthy()

        })

    })
})