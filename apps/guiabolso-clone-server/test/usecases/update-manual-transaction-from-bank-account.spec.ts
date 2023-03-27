import { InvalidTransactionError } from "@/entities/errors"
import { CategoryData, TransactionData, BankAccountData, UserData } from "@/usecases/ports"
import { UpdateManualTransactionFromBank } from "@/usecases/update-manual-transaction-from-bank"
import { TransactionToUpdateData } from "@/usecases/update-manual-transaction/ports"
import { InMemoryAccountRepository, InMemoryTransactionRepository } from "@test/doubles/repositories"

describe('update manual transaction from bank account use case', () => {
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

    test('should not update transaction without description', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId,
            accountType,
            syncType,
            userId,
            description,
            amount,
            date,
            type: 'INCOME'
        }

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: bankAccountData,
                category: categoryData,
                amount,
                // description,
                date,
                comment,
                ignored,
            },
        }

        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
        expect(response.message).toBe('Required some description')
    })

    test('should not update transaction with zero amount', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId,
            accountType,
            syncType,
            userId,
            description,
            amount,
            date,
            type: 'INCOME'
        }

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: bankAccountData,
                category: categoryData,
                amount: 0,
                description,
                date,
                comment,
                ignored,
            },
        }

        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
        expect(response.message).toBe('Invalid amount')
    })

    test('should update transaction of type expense and update account balance', async () => {
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

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: bankAccountData,
                category: categoryData,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            },
        }

        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const response = (await sut.perform(request)).value as TransactionData

        const updated = await transactionRepository.findById(transactionId)
        expect(updated.amount).toBe(-400)
        expect(updated.type).toBe('EXPENSE')
        expect(updated.description).toBe('new description')
        expect(updated.date).toEqual(new Date('2023-04-10'))
        expect(updated.comment).toEqual('new comment')
        expect(updated.ignored).toEqual(true)
        const newBalance = (await accountRepository.findById(accountId)).balance
        expect(newBalance).toBe(balance - amount + request.newTransaction.amount)
    })

    test('should update transaction of type income and update account balance', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId,
            accountType,
            syncType,
            userId,
            description,
            amount,
            date,
            type: 'EXPENSE',
            category: categoryData1,
        }

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: bankAccountData,
                category: categoryData,
                amount: 150,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            },
        }

        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const response = (await sut.perform(request)).value as TransactionData

        const updated = await transactionRepository.findById(transactionId)
        expect(updated.amount).toBe(150)
        expect(updated.type).toBe('INCOME')
        expect(updated.description).toBe('new description')
        expect(updated.date).toEqual(new Date('2023-04-10'))
        expect(updated.comment).toEqual('new comment')
        expect(updated.ignored).toEqual(true)
        const newBalance = (await accountRepository.findById(accountId)).balance
        expect(newBalance).toBe(balance - amount + request.newTransaction.amount)
    })

    test('should update transaction with new category', async () => {
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

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: bankAccountData,
                category: categoryData,
                amount,
                description,
                date,
                comment,
                ignored,
            },
        }

        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const response = (await sut.perform(request)).value as TransactionData
        expect((await transactionRepository.findById(transactionId)).category.id).toBe(request.newTransaction.category.id)
    })

    test('should update transaction without category', async () => {
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
        }

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: bankAccountData,
                amount,
                description,
                date,
                comment,
                ignored,
            },
        }

        const accountRepository = new InMemoryAccountRepository([bankAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const sut = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const response = (await sut.perform(request)).value as TransactionData
        expect((await transactionRepository.findById(transactionId)).category).not.toBeDefined()
    })
})