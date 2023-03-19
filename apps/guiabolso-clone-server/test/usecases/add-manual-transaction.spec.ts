import { InvalidTransactionError } from "@/entities/errors"
import { AddManualTransaction } from "@/usecases/add-manual-transaction"
import { AddManualTransactionToBank } from "@/usecases/add-manual-transaction-to-bank"
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, CategoryData, TransactionData, TransactionRequest, UserData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(UnregisteredUserError)

        })

        test('should not add transaction if category is not found', async () => {

            const transactionRequest: TransactionRequest = {
                accountId: walletAccountId,
                categoryId: 'invalid',
                amount,
                date,
                comment,
                ignored,
            }
    
            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository,addManualTransactionToWallet, addManualTransactionToBank)
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(UnregisteredCategoryError)
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)
            
            
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
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
            const addManualTransactionToBank = new AddManualTransactionToBank(accountRepository, transactionRepository)
            
            const sut = new AddManualTransaction(userRepository, accountRepository, categoryRepository, addManualTransactionToWallet, addManualTransactionToBank)
            
    
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.id).not.toBeUndefined()
            expect(await transactionRepository.exists(response.id)).toBe(true)
            expect((await accountRepository.findById(walletAccountId)).balance).toBe(balance + transactionRequest.amount)
        })
    })

    // describe.skip('add manual transaction to bank account', () => {
    //     const userId = 'u0'
    //     const categoryId = 'c0'
    //     const amount = -5060
    //     const description = 'valid description'
    //     const date = new Date('2023-03-09')
    //     const comment = 'valid comment'
    //     const ignored = false
    
    //     const categoryData: CategoryData = {
    //         name: "category 0",
    //         group: "group 0",
    //         iconName: "icon 0",
    //         primaryColor: "color 0",
    //         ignored: true,
    //         id: categoryId,
    //     }
        
        
    //     const accountId = 'ac0'
    //     const accountType = 'BANK'
    //     const syncType = 'MANUAL'
    //     const name = 'valid bank account'
    //     const balance = 678
    //     const imageUrl = 'valid image url'
    
    //     let bankAccountData: BankAccountData
    
    //     beforeEach(() => {
    //         bankAccountData = {
    //             id: accountId,
    //             type: accountType,
    //             syncType,
    //             name,
    //             balance,
    //             imageUrl,
    //             userId,
    //         }
    //     })

    //     test('should not add transaction without required field', async () => {
    //         const transactionRequest: TransactionRequest = {
    //             accountId,
    //             categoryId,
    //             amount,
    //             date,
    //             comment,
    //             ignored,
    //         }

    //         const userRepository = new InMemoryUserRepository([userData])
    //         const accountRepository = new InMemoryAccountRepository([bankAccountData])
    //         const categoryRepository = new InMemoryCategoryRepository([categoryData])
    //         const transactionRepository = new InMemoryTransactionRepository([])
    //         const addManualTransactionToWallet = new AddManualTransactionToWallet(accountRepository, transactionRepository)
    //         const addManualTransactionToBank = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
            
    //         const sut = new AddManualTransaction(addManualTransactionToWallet, addManualTransactionToBank)
    //         const response = (await sut.perform(transactionRequest)).value as Error
    //         expect(response).toBeInstanceOf(InvalidTransactionError)

    //     })
    // })

    
})