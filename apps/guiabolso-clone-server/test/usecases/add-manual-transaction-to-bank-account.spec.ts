import { InvalidTransactionError } from "@/entities/errors"
import { AddManualTransactionToBank } from "@/usecases/add-manual-transaction-to-bank"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, CategoryData, TransactionData, TransactionRequest } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('add manual transaction to bank account use case', () => {
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

    test('should not add transaction if account is not found', async () => {

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
        const accountRepository = new InMemoryAccountRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not add transaction if user of account is not found', async () => {

        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    // TODO descriptionOriginal isn't a valid field of a manual transaction, maybe should be removed
    test('should not add transaction without description or descriptionOriginal', async () => {

        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId,
            amount,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
    })

    test('should not add transaction if category is not found', async () => {

        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId: 'invalid',
            amount,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredCategoryError)
    })

    test('should not add transaction with zero amount', async () => {

        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId,
            amount: 0,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
        expect(response.message).toBe('Invalid amount')
    })

    test('should add transaction of type expense and update account balance', async () => {

        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId,
            amount: -4567,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect(response.type).toBe('EXPENSE')
        expect(await transactionRepository.exists(response.id)).toBe(true)
        expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    test('should add transaction of type income and update account balance', async () => {

        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId,
            amount: 4567,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect(response.type).toBe('INCOME')
        expect(await transactionRepository.exists(response.id)).toBe(true)
        expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    test('should add transaction with optional category', async () => {
        const transactionRequest: TransactionRequest = {
            accountId,
            categoryId,
            amount: 4567,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect((await transactionRepository.findById(response.id)).category).toEqual(categoryData)
        expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    test('should add transaction without optional category', async () => {
        const transactionRequest: TransactionRequest = {
            accountId,
            amount: 4567,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToBank(userRepository, accountRepository, transactionRepository, categoryRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect((await transactionRepository.findById(response.id)).category).toBeNull()
        expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })
})