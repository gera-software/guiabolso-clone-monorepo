import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, CategoryData, TransactionData, TransactionRequest, UserData, WalletAccountData } from "@/usecases/ports"
import { UpdateManualTransaction } from "@/usecases/update-manual-transaction"
import { UpdateManualTransactionFromBank } from "@/usecases/update-manual-transaction-from-bank"
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Update manual transaction from account use case', () => {
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

    test('should not update if transaction not found', async () => {
        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: walletAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredTransactionError)
    })

    test('should not update if user is not found', async () => {
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

        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: walletAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not update if account is not found', async () => {
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

        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: walletAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not update if new category is not found', async () => {
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

        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: walletAccountId,
            categoryId: 'invalid',
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)        
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredCategoryError)
    })

    test('should not return error when transaction doesnt have a category', async () => {
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

        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: walletAccountId,
            // categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)        
        const response = (await sut.perform(transactionRequest)).value
        expect(response).not.toBeInstanceOf(Error)
    })

    describe('update manual transaction from wallet account', () => {

        test('should update transaction and update account balance', async () => {
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
    
            const transactionRequest: TransactionRequest = {
                id: transactionId,
                accountId: walletAccountId,
                categoryId,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

            const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)            
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            
            const updated = await transactionRepository.findById(transactionId)
            expect(updated.amount).toBe(-400)
            expect(updated.type).toBe('EXPENSE')
            expect(updated.description).toBe('new description')
            expect(updated.date).toEqual(new Date('2023-04-10'))
            expect(updated.comment).toEqual('new comment')
            expect(updated.ignored).toEqual(true)
            expect(updated.category.id).toBe(categoryId)
            const newBalance = (await accountRepository.findById(walletAccountId)).balance
            expect(newBalance).toBe(balance - amount + transactionRequest.amount)
        })
    })

    describe('update manual transaction from bank account', () => {

        test('should update transaction and update account balance', async () => {
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
    
            const transactionRequest: TransactionRequest = {
                id: transactionId,
                accountId: bankAccountId,
                categoryId,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)

            const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank)            
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            
            const updated = await transactionRepository.findById(transactionId)
            expect(updated.amount).toBe(-400)
            expect(updated.type).toBe('EXPENSE')
            expect(updated.description).toBe('new description')
            expect(updated.date).toEqual(new Date('2023-04-10'))
            expect(updated.comment).toEqual('new comment')
            expect(updated.ignored).toEqual(true)
            expect(updated.category.id).toBe(categoryId)
            const newBalance = (await accountRepository.findById(bankAccountId)).balance
            expect(newBalance).toBe(balance - amount + transactionRequest.amount)
        })
    })
})