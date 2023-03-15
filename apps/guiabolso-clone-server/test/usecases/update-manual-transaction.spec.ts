import { UnregisteredTransactionError } from "@/usecases/errors"
import { CategoryData, TransactionData, TransactionRequest, WalletAccountData } from "@/usecases/ports"
import { UpdateManualTransaction } from "@/usecases/update-manual-transaction"
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

    describe('update manual transaction from wallet account', () => {

        test('should not update if transaction not found', async () => {
            const transactionRequest: TransactionRequest = {
                id: transactionId,
                accountId,
                categoryId,
                amount,
                date,
                comment,
                ignored,
            }

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, categoryRepository, accountRepository, userRepository)

            const sut = new UpdateManualTransaction(updateManualTransactionFromWallet)
            const response = (await sut.perform(transactionRequest)).value as Error
            expect(response).toBeInstanceOf(UnregisteredTransactionError)
        })

        test('should update transaction and update account balance', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId,
                accountType,
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
                accountId,
                categoryId,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            }

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, categoryRepository, accountRepository, userRepository)

            const sut = new UpdateManualTransaction(updateManualTransactionFromWallet)
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            
            const updated = await transactionRepository.findById(transactionId)
            expect(updated.amount).toBe(-400)
            expect(updated.type).toBe('EXPENSE')
            expect(updated.description).toBe('new description')
            expect(updated.date).toEqual(new Date('2023-04-10'))
            expect(updated.comment).toEqual('new comment')
            expect(updated.ignored).toEqual(true)
            const newBalance = (await accountRepository.findById(accountId)).balance
            expect(newBalance).toBe(balance - amount + transactionRequest.amount)
        })
    })
})