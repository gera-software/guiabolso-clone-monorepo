import { UnregisteredTransactionError } from "@/usecases/errors"
import { CategoryData, TransactionData, WalletAccountData } from "@/usecases/ports"
import { RemoveManualTransaction } from "@/usecases/remove-manual-transaction"
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet"
import { InMemoryAccountRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Remove manual transaction from account use case', () => {
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

    describe('remove manual transaction from wallet account', () => {

        test('should return error if removing unexisting transaction', async () => {
            const id = 'inexistent id'

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            
            const sut = new RemoveManualTransaction(removeManualTransactionFromWallet)
            const result = (await sut.perform(id)).value as Error
            expect(result).toBeInstanceOf(UnregisteredTransactionError)
        })

        test('should remove a transaction and update account balance', async () => {
            const id = 'valid id'
            const transactionData: TransactionData = {
                id, 
                accountId,
                accountType,
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

            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const accountRepository = new InMemoryAccountRepository([walletAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const removeManualTransactionFromWallet = new RemoveManualTransactionFromWallet(transactionRepository, accountRepository, userRepository)
            
            const sut = new RemoveManualTransaction(removeManualTransactionFromWallet)
            const response = (await sut.perform(id)).value as TransactionData
            expect(response._isDeleted).toEqual(true)
            expect(await transactionRepository.exists(id)).toBeFalsy()
            expect((await accountRepository.findById(accountId)).balance).toBe(balance - transactionData.amount)
        })
    })
})