import { InvalidTransactionError } from "@/entities/errors"
import { AddManualTransaction } from "@/usecases/add-manual-transaction"
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet"
import { CategoryData, TransactionData, TransactionRequest, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Add manual transaction to account use case', () => {
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
    describe('add manual transaction to wallet account', () => {
        test('should not add transaction without required field', async () => {
            const transactionRequest: TransactionRequest = {
                accountId,
                categoryId,
                amount,
                date,
                comment,
                ignored,
            }

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(userRepository, accountRepository, transactionRepository, categoryRepository)
            
            const sut = new AddManualTransaction(addManualTransactionToWallet)
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(InvalidTransactionError)

        })

        test('should add a valid transaction and update account balance', async () => {
            const transactionRequest: TransactionRequest = {
                accountId,
                categoryId,
                amount,
                description,
                date,
                comment,
                ignored,
            }

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const addManualTransactionToWallet = new AddManualTransactionToWallet(userRepository, accountRepository, transactionRepository, categoryRepository)
            
            const sut = new AddManualTransaction(addManualTransactionToWallet)
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.id).not.toBeUndefined()
            expect(await transactionRepository.exists(response.id)).toBe(true)
            expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
        })
    })
})