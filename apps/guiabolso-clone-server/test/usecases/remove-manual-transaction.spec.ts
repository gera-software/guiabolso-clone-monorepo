import { UnregisteredTransactionError } from "@/usecases/errors"
import { BankAccountData, CategoryData, TransactionData, UserData, WalletAccountData } from "@/usecases/ports"
import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction"
import { RemoveManualTransactionFromBank } from "@/usecases/remove-manual-transaction-from-bank"
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet"
import { InMemoryAccountRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

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

    describe('generic verifications', () => {
        test('should return error if removing unexisting transaction', async () => {
            const id = 'inexistent id'

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank)
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank)
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank)
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            const removeManualTransactionFromBank = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
            
            const sut = new RemoveManualTransaction(transactionRepository, removeManualTransactionFromWallet, removeManualTransactionFromBank)
            const response = (await sut.perform(id)).value as TransactionData
            expect(response._isDeleted).toEqual(true)
            expect(await transactionRepository.exists(id)).toBeFalsy()
            expect((await accountRepository.findById(bankAccountId)).balance).toBe(balance - transactionData.amount)
        })
    })
})