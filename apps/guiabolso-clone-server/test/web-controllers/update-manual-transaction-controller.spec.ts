import { BankAccountData, CategoryData, TransactionData, UseCase, UserData, WalletAccountData } from "@/usecases/ports"
import { UpdateManualTransaction } from "@/usecases/update-manual-transaction"
import { UpdateManualTransactionFromBank } from "@/usecases/update-manual-transaction-from-bank"
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet"
import { UpdateManualTransactionController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Update manual transaction web controller', () => {
    const transactionId = 'valid id'
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

    const categoryData1: CategoryData = {
        name: "category 1",
        group: "group 1",
        iconName: "icon 1",
        primaryColor: "color 1",
        ignored: true,
        id: "c1",
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
        const transactionRepository = new InMemoryTransactionRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

        const usecase = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)  
        const sut = new UpdateManualTransactionController(usecase)
        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect(response.body.message).toBe("Missing parameters from request: id, accountId, amount, date, description.")
    })

    test('should return status code 500 when server raises', async () => {
        const validRequest: HttpRequest = {
            body: {
                id: transactionId,
                accountId: walletAccountId,
                categoryId,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            }
        }

        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new UpdateManualTransactionController(errorThrowingUseCaseStub)
        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })

    describe('Update manual transaction from wallet account', () => {

        test('should return status code 200 ok when request is valid', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: walletAccountId,
                accountType: walletAccountType,
                syncType,
                userId,
                description,
                amount,
                date,
                type: 'INCOME',
                category: categoryData1,
            }
            
            const validRequest: HttpRequest = {
                body: {
                    id: transactionId,
                    accountId: walletAccountId,
                    categoryId,
                    amount: -400,
                    description: 'new description',
                    date: new Date('2023-04-10'),
                    comment: 'new comment',
                    ignored: true,
                }
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

            const usecase = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)  
            const sut = new UpdateManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body.id).toBeTruthy()
        })

    })

    describe('Update manual transaction from bank account', () => {

        test('should return status code 200 ok when request is valid', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: bankAccountId,
                accountType: bankAccountType,
                syncType,
                userId,
                description,
                amount,
                date,
                type: 'INCOME',
                category: categoryData1,
            }
            
            const validRequest: HttpRequest = {
                body: {
                    id: transactionId,
                    accountId: bankAccountId,
                    categoryId,
                    amount: -400,
                    description: 'new description',
                    date: new Date('2023-04-10'),
                    comment: 'new comment',
                    ignored: true,
                }
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

            const usecase = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)  
            const sut = new UpdateManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body.id).toBeTruthy()
        })

    })

    test.todo('Update manual transaction from credit card account')
})