import { CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, UserData } from "@/usecases/ports"
import { RemoveManualTransactionFromCreditCard } from "@/usecases/remove-manual-transaction-from-credit-card"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('remove manual transaction from credit card account use case', () => {
    const userId = 'u0'
    const categoryId = 'c0'
    const amount = -5060
    const type = 'EXPENSE'
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
    
    
    const accountId = 'ac0'
    const accountType = 'CREDIT_CARD'
    const syncType = 'MANUAL'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000


    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        creditCardAccountData = {
            id: accountId,
            type: accountType,
            syncType,
            name: 'valid credit card account',
            balance,
            imageUrl,
            userId,
            creditCardInfo: {
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: availableCreditLimit,
                closeDay: 3,
                dueDay: 10
            }
        }
    })

    test('should remove a transaction of type expense, update invoice amount and account balance', async () => {
        const id = 'valid id'
        const expectedInvoiceAmount = -10000
        const transactionAmount = -5678

        const invoiceData: CreditCardInvoiceData = {
            id: 'invoice id',
            dueDate: new Date('2023-03-10'),
            closeDate: new Date('2023-03-03'),
            amount: expectedInvoiceAmount + transactionAmount,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactionData: TransactionData = {
            id, 
            accountId,
            accountType,
            syncType,
            userId,
            amount: transactionAmount,
            date: new Date('2023-03-01'),
            type: 'EXPENSE',
            description,
            comment,
            ignored,
            _isDeleted: false,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
        const sut = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
        const response = (await sut.perform(id)).value as TransactionData
        expect(response._isDeleted).toEqual(true)

        expect((await invoiceRepository.findById(invoiceData.id)).amount).toBe(expectedInvoiceAmount)
        const account = await accountRepository.findById(accountId)
        expect(account.balance).toBe(expectedInvoiceAmount)
        expect(account.creditCardInfo.availableCreditLimit).toBe(availableCreditLimit - transactionData.amount)
    })

    test('should remove a transaction of type income, update invoice amount and account balance', async () => {
        const id = 'valid id'
        const expectedInvoiceAmount = -10000
        const transactionAmount = 5678

        const invoiceData: CreditCardInvoiceData = {
            id: 'invoice id',
            dueDate: new Date('2023-03-10'),
            closeDate: new Date('2023-03-03'),
            amount: expectedInvoiceAmount + transactionAmount,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactionData: TransactionData = {
            id, 
            accountId,
            accountType,
            syncType,
            userId,
            amount: transactionAmount,
            date: new Date('2023-03-01'),
            type: 'INCOME',
            description,
            comment,
            ignored,
            _isDeleted: false,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
        const sut = new RemoveManualTransactionFromCreditCard(transactionRepository, accountRepository, userRepository, invoiceRepository)
        const response = (await sut.perform(id)).value as TransactionData
        expect(response._isDeleted).toEqual(true)

        expect((await invoiceRepository.findById(invoiceData.id)).amount).toBe(expectedInvoiceAmount)
        const account = await accountRepository.findById(accountId)
        expect(account.balance).toBe(expectedInvoiceAmount)
        expect(account.creditCardInfo.availableCreditLimit).toBe(availableCreditLimit - transactionData.amount)
    })

})