import { UnregisteredTransactionError } from "@/usecases/errors"
import { BankAccountData, CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, UserData, WalletAccountData } from "@/usecases/ports"
import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction"
import { RemoveManualTransactionFromBank } from "@/usecases/remove-manual-transaction-from-bank"
import { RemoveManualTransactionFromCreditCard } from "@/usecases/remove-manual-transaction-from-credit-card"
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Remove manual transaction from account use case', () => {
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
    const creditCardAccountId = 'cac0'
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

    describe('generic verifications', () => {
        test('should return error if removing unexisting transaction', async () => {
            const id = 'inexistent id'

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)
            const result = (await sut.perform(id)).value as Error
            expect(result).toBeInstanceOf(UnregisteredTransactionError)
        })

        test('should return error if removing already removed transaction', async () => {
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
                _isDeleted: true,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)
            const result = (await sut.perform(id)).value as Error
            expect(result).toBeInstanceOf(UnregisteredTransactionError)
        })
    })

    describe('remove manual transaction from wallet account', () => {
        test('should remove a transaction and update account balance', async () => {
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

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)
            const response = (await sut.perform(id)).value as TransactionData
            expect(response._isDeleted).toEqual(true)
            expect(await transactionRepository.exists(id)).toBeFalsy()
            expect((await accountRepository.findById(walletAccountId)).balance).toBe(balance - transactionData.amount)
        })
    })

    describe('remove manual transaction from bank account', () => {
        test('should remove a transaction and update account balance', async () => {
            const id = 'valid id'
            const transactionData: TransactionData = {
                id, 
                accountId: bankAccountId,
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

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)
            const response = (await sut.perform(id)).value as TransactionData
            expect(response._isDeleted).toEqual(true)
            expect(await transactionRepository.exists(id)).toBeFalsy()
            expect((await accountRepository.findById(bankAccountId)).balance).toBe(balance - transactionData.amount)
        })
    })

    describe('remove manual transaction from credit card account', () => {
        test('should remove a transaction, update invoice and account balance', async () => {
            const id = 'valid id'
            const expectedInvoiceAmount = -10000
            const transactionAmount = -5678
    
            const invoiceData: CreditCardInvoiceData = {
                id: 'invoice id',
                dueDate: new Date('2023-03-10'),
                closeDate: new Date('2023-03-03'),
                amount: expectedInvoiceAmount + transactionAmount,
                userId: userData.id,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }
    
            const transactionData: TransactionData = {
                id, 
                accountId: creditCardAccountData.id,
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

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromCreditCard = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank, removeManualTransactionFromCreditCard)
            const response = (await sut.perform(id)).value as TransactionData
            expect(response._isDeleted).toEqual(true)
            expect(await transactionRepository.exists(id)).toBeFalsy()

            
            expect((await invoiceRepository.findById(invoiceData.id)).amount).toBe(expectedInvoiceAmount)
            const account = await accountRepository.findById(creditCardAccountData.id)
            expect(account.balance).toBe(expectedInvoiceAmount)
            expect(account.creditCardInfo.availableCreditLimit).toBe(availableCreditLimit - transactionData.amount)
        })
    })
})