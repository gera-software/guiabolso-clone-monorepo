import { TransactionType } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet"
import { UnregisteredAccountError, UnregisteredUserError } from "@/usecases/errors"
import { TransactionData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('add manual transaction to wallet account use case', () => {
    const userId = '0'
    const categoryId = '0'
    const amount = -5060
    const description = 'valid description'
    const date = new Date('2023-03-09')
    const type: TransactionType = 'EXPENSE'
    const comment = 'valid comment'
    const ignored = false
    
    
    const accountId = '0'
    const accountType = 'WALLET'
    const syncType = 'MANUAL'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'

    const walletAccountData: WalletAccountData = {
        id: accountId,
        type: accountType,
        syncType,
        name,
        balance,
        imageUrl,
        userId,
    }

    test('should not add transaction if account is not found', async () => {

        const transactionRequest: TransactionData = {
            accountId,
            categoryId,
            amount,
            description,
            date,
            type,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([])
        const sut = new AddManualTransactionToWallet(userRepository, accountRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not add transaction if user of account is not found', async () => {

        const transactionRequest: TransactionData = {
            accountId,
            categoryId,
            amount,
            description,
            date,
            type,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([])
        const accountRepository = new InMemoryAccountRepository([walletAccountData])
        const sut = new AddManualTransactionToWallet(userRepository, accountRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not add transaction without description or descriptionOriginal', async () => {

        const transactionRequest: TransactionData = {
            accountId,
            categoryId,
            amount,
            date,
            type,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([walletAccountData])
        const sut = new AddManualTransactionToWallet(userRepository, accountRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
    })

    test('should not add transaction with zero amount', async () => {

        const transactionRequest: TransactionData = {
            accountId,
            categoryId,
            amount: 0,
            description,
            date,
            type,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([walletAccountData])
        const sut = new AddManualTransactionToWallet(userRepository, accountRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
        expect(response.message).toBe('Invalid amount')
    })

    test('should add transaction of type expense', async () => {

        const transactionRequest: TransactionData = {
            accountId,
            categoryId,
            amount: -4567,
            description,
            date,
            type: 'EXPENSE',
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([walletAccountData])
        const sut = new AddManualTransactionToWallet(userRepository, accountRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBe(2)
    })
})