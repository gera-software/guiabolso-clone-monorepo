import { UnregisteredTransactionError } from "@/usecases/errors"
import { CategoryData, TransactionData, BankAccountData } from "@/usecases/ports"
import { RemoveManualTransactionFromBank } from "@/usecases/remove-manual-transaction-from-bank"
import { InMemoryAccountRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('remove manual transaction from bank account use case', () => {
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
    const accountType = 'BANK'
    const syncType = 'MANUAL'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'

    let bankAccountData: BankAccountData

    beforeEach(() => {
        bankAccountData = {
            id: accountId,
            type: accountType,
            syncType,
            name,
            balance,
            imageUrl,
            userId,
        }
    })

    test('should return error if removing unexisting transaction', async () => {
        const id = 'inexistent id'
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
        const error = (await sut.perform(id)).value as Error
        expect(error).toBeInstanceOf(UnregisteredTransactionError)
    })

    test('should return error if removing already removed transaction', async () => {
        const id = 'removed id'
        const transactionData: TransactionData = {
            id, 
            accountId,
            accountType,
            syncType,
            userId,
            amount,
            date,
            type,
            description,
            comment,
            ignored,
            _isDeleted: true,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
        const error = (await sut.perform(id)).value as Error
        expect(error).toBeInstanceOf(UnregisteredTransactionError)
    })

    test('should remove a transaction of type expense and update account balance', async () => {
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
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
        const response = (await sut.perform(id)).value as TransactionData
        expect(response._isDeleted).toEqual(true)
        expect(await transactionRepository.exists(id)).toBeFalsy()
        expect((await accountRepository.findById(accountId)).balance).toBe(balance - transactionData.amount)
    })

    test('should remove a transaction of type income and update account balance', async () => {
        const id = 'valid id'
        const transactionData: TransactionData = {
            id, 
            accountId,
            accountType,
            syncType,
            userId,
            amount: 5678,
            date,
            type: 'INCOME',
            description,
            comment,
            ignored,
            _isDeleted: false,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new RemoveManualTransactionFromBank(transactionRepository, accountRepository, userRepository)
        const response = (await sut.perform(id)).value as TransactionData
        expect(response._isDeleted).toEqual(true)
        expect(await transactionRepository.exists(id)).toBeFalsy()
        expect((await accountRepository.findById(accountId)).balance).toBe(balance - transactionData.amount)
    })
})