import { BankAccountData, CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, UseCase, WalletAccountData } from "@/usecases/ports"
import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction"
import { RemoveManualTransactionFromBank } from "@/usecases/remove-manual-transaction-from-bank"
import { RemoveManualTransactionFromCreditCard } from "@/usecases/remove-manual-transaction-from-credit-card"
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet"
import { RemoveManualTransactionController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
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
    
    
    const walletAccountId = 'ac0'
    const walletAccountType = 'WALLET'
    const bankAccountId = 'bac0'
    const bankAccountType = 'BANK'
    const creditCardAccountId = 'ca0'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'MANUAL'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000

    let walletAccountData: WalletAccountData
    let bankAccountData: BankAccountData
    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        walletAccountData = {
            id: walletAccountId,
            type: walletAccountType,
            syncType,
            name,
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
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
        const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
        const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
        
        const usecase = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)

        const sut = new RemoveManualTransactionController(usecase)
        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect(response.body.message).toBe("Missing parameters from request: id.")

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

    describe('Remove manual transaction from wallet account', () => {

        test('should return status code 200 ok when request is valid', async () => {
            const id = 'valid id'
            const transactionData: TransactionData = {
                id, 
                accountId: walletAccountId,
                accountType: walletAccountType,
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const usecase = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)

            const sut = new RemoveManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body._isDeleted).toEqual(true)
        })


    })

    describe('Remove manual transaction from bank account', () => {

        test('should return status code 200 ok when request is valid', async () => {
            const id = 'valid id'
            const transactionData: TransactionData = {
                id, 
                accountId: bankAccountId,
                accountType: bankAccountType,
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const usecase = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)

            const sut = new RemoveManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body._isDeleted).toEqual(true)
        })


    })

    describe('Remove manual transaction from credit card account', () => {

        test('should return status code 200 ok when request is valid', async () => {
            const id = 'valid id'
            const expectedInvoiceAmount = -10000
            const transactionAmount = -5678
    
            const invoiceData: CreditCardInvoiceData = {
                id: 'invoice id',
                dueDate: new Date('2023-03-10'),
                closeDate: new Date('2023-03-03'),
                amount: expectedInvoiceAmount + transactionAmount,
                userId: userId,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }

            const transactionData: TransactionData = {
                id, 
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                amount: transactionAmount,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-03-01'),
                invoiceId: invoiceData.id,
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const usecase = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)

            const sut = new RemoveManualTransactionController(usecase)
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.body._isDeleted).toEqual(true)
        })


    })

})