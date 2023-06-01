import { InvalidAccountError, InvalidTransactionError } from "@/entities/errors"
import { AddManualTransaction } from "@/usecases/add-manual-transaction"
import { AddManualTransactionToBank } from "@/usecases/add-manual-transaction-to-bank"
import { AddManualTransactionToCreditCard } from "@/usecases/add-manual-transaction-to-credit-card"
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, CategoryData, CreditCardAccountData, TransactionData, TransactionRequest, UserData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import * as sinon from 'sinon'

describe('Add manual transaction to account use case', () => {
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
    const creditCardAccountId = 'ccac0'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'MANUAL'
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
            name: 'valid wallet account',
            balance,
            imageUrl,
            userId,
        }
        
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

    describe('generic verifications', () => {

        test('should not add transaction if account is not found', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: 'invalid account id',
                categoryId,
                amount,
                description,
                date,
                comment,
                ignored,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)

            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(UnregisteredAccountError)

        })

        test('should not add transaction if user of account is not found', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: walletAccountId,
                categoryId,
                amount,
                description,
                date,
                comment,
                ignored,
            }

            const userRepository = new InMemoryUserRepository([])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)

            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(UnregisteredUserError)

        })

        test('should not add transaction if account is not of sync type MANUAL', async () => {
            bankAccountData = {
                id: bankAccountId,
                type: bankAccountType,
                syncType: 'AUTOMATIC',
                name: 'valid bank account',
                balance,
                imageUrl,
                userId,
            }

            const transactionRequest: TransactionRequest = {
                accountId: bankAccountId,
                categoryId,
                amount,
                description,
                date,
                comment,
                ignored,
            }

            const userRepository = new InMemoryUserRepository([])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)

            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(InvalidAccountError)
            expect(response.message).toBe('Operação não permitida')

        })

        test('should not add transaction if category is not found', async () => {

            const transactionRequest: TransactionRequest = {
                accountId: walletAccountId,
                categoryId: 'invalid',
                amount,
                description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)

            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(UnregisteredCategoryError)
        })

        test('should not return error when transaction doesnt have a category', async () => {

            const transactionRequest: TransactionRequest = {
                accountId: bankAccountId,
                // categoryId: 'invalid',
                amount,
                description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)

            const response = (await sut.perform(transactionRequest)).value
            expect(response).not.toBeInstanceOf(Error)
        })
    })

    describe('wallet transactions', () => {

        test('should not add transaction without required field', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: walletAccountId,
                categoryId,
                amount,
                // description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
            
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(InvalidTransactionError)

        })

        test('should add a valid transaction and update account balance', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: walletAccountId,
                categoryId,
                amount,
                description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
    
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.id).not.toBeUndefined()
            expect(await transactionRepository.exists(response.id)).toBe(true)
            expect((await accountRepository.findById(walletAccountId)).balance).toBe(balance + transactionRequest.amount)
        })
    })

    describe('bank transactions', () => {

        test('should not add transaction without required field', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: bankAccountId,
                categoryId,
                amount,
                // description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
            
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(InvalidTransactionError)

        })

        test('should add a valid transaction and update account balance', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: bankAccountId,
                categoryId,
                amount,
                description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
            
    
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.id).not.toBeUndefined()
            expect(await transactionRepository.exists(response.id)).toBe(true)
            expect((await accountRepository.findById(bankAccountId)).balance).toBe(balance + transactionRequest.amount)
        })
    })

    describe('credit card transaction', () => {
        test('should not add transaction without required field', async () => {
            const transactionRequest: TransactionRequest = {
                accountId: creditCardAccountId,
                categoryId,
                amount,
                // description,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
            
            
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(InvalidTransactionError)
        })

        test('should add a valid transaction, update account balance and invoice amount', async () => {
            const clock = sinon.useFakeTimers(new Date('2023-04-03'))

            const transactionRequest: TransactionRequest = {
                accountId: creditCardAccountId,
                categoryId,
                amount,
                description,
                date: new Date('2023-03-02'),
                comment,
                ignored,
            }
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            const addManualTransactionToCreditCard = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, invoiceRepository)
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank, addManualTransactionToCreditCard)
            
    
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.id).not.toBeUndefined()
            expect(await transactionRepository.exists(response.id)).toBe(true)

            const lastInvoice = await invoiceRepository.findById(response.invoiceId)
            expect(lastInvoice.amount).toBe(transactionRequest.amount)
            expect((await accountRepository.findById(creditCardAccountId)).balance).toBe(lastInvoice.amount)
            clock.restore()
        })
    })

})