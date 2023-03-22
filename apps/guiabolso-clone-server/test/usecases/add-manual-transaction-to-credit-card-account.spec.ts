import { InvalidTransactionError } from "@/entities/errors"
import { AddManualTransactionToCreditCard } from "@/usecases/add-manual-transaction-to-credit-card"
import { CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, UserData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository } from "@test/doubles/repositories"

describe('add manual transaction to credit card account use case', () => {
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
    
    
    const accountId = 'ac0'
    const accountType = 'CREDIT_CARD'
    const syncType = 'MANUAL'
    const name = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'

    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        creditCardAccountData = {
            id: accountId,
            type: accountType,
            syncType,
            name,
            balance,
            imageUrl,
            userId,
            creditCardInfo: {
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: 100000,
                closeDay: 3,
                dueDay: 10
            }
        }
    })

    // TODO descriptionOriginal isn't a valid field of a manual transaction, maybe should be removed
    test('should not add transaction without description or descriptionOriginal', async () => {

        const transactionRequest = {
            user: userData, 
            account: creditCardAccountData, 
            category: categoryData,
            amount,
            // description,
            date,
            comment,
            ignored,
        }

        const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
    })

    test('should not add transaction with zero amount', async () => {

        const transactionRequest = {
            user: userData, 
            account: creditCardAccountData, 
            category: categoryData,
            amount: 0,
            description,
            date,
            comment,
            ignored,
        }

        const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
        expect(response.message).toBe('Invalid amount')
    })

    test('should add transaction of type expense and update invoice balance', async () => {
        const invoiceData: CreditCardInvoiceData = {
            id: 'maio/23',
            dueDate: new Date('2023-04-10'),
            closeDate: new Date('2023-04-03'),
            amount: 0,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactionRequest = {
            user: userData, 
            account: creditCardAccountData, 
            category: categoryData,
            amount: -4567,
            description,
            date: new Date('2023-03-17'),
            comment,
            ignored,
        }

        const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect(response.type).toBe('EXPENSE')
        expect(response.date).toEqual(new Date('2023-04-10'))
        expect(response.invoiceDate).toEqual(new Date('2023-03-17'))
        expect(await transactionRepository.exists(response.id)).toBe(true)
        // expect((await creditCardInvoiceRepository.findById('maio/23')).amount).toBe(-4567)

        // expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    test('should add transaction of type income and update invoice balance', async () => {
        const invoiceData: CreditCardInvoiceData = {
            id: 'maio/23',
            dueDate: new Date('2023-04-10'),
            closeDate: new Date('2023-04-03'),
            amount: 0,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactionRequest = {
            user: userData, 
            account: creditCardAccountData, 
            category: categoryData,
            amount: 4567,
            description,
            date: new Date('2023-03-17'),
            comment,
            ignored,
        }

        const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect(response.type).toBe('INCOME')
        expect(response.date).toEqual(new Date('2023-04-10'))
        expect(response.invoiceDate).toEqual(new Date('2023-03-17'))
        expect(await transactionRepository.exists(response.id)).toBe(true)
        // expect((await creditCardInvoiceRepository.findById('maio/23')).amount).toBe(4567)

        // expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    test('should add transaction with category', async () => {
        const transactionRequest = {
            user: userData, 
            account: creditCardAccountData, 
            category: categoryData,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect((await transactionRepository.findById(response.id)).category).toEqual(categoryData)
        // expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    test('should add transaction without category', async () => {
        const transactionRequest = {
            user: userData, 
            account: creditCardAccountData, 
            // category: categoryData,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData
        expect(response.id).not.toBeUndefined()
        expect((await transactionRepository.findById(response.id)).category).toBeNull()
        // expect((await accountRepository.findById(accountId)).balance).toBe(balance + transactionRequest.amount)
    })

    describe('invoices', () => {
        test('transactions on closing date should belong to next month\'s invoice', async () => {
            const validClosingDate = new Date('2023-03-03')
            const validDueDate = new Date('2023-04-10')

            const invoiceData: CreditCardInvoiceData = {
                id: 'invoiceId',
                dueDate: validDueDate,
                closeDate: validClosingDate,
                amount: 0,
                userId: userData.id,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }
    
            const transactionDate = new Date(validClosingDate)
            
            const transactionRequest = {
                user: userData, 
                account: creditCardAccountData, 
                category: categoryData,
                amount: -4567,
                description,
                date: transactionDate,
                comment,
                ignored,
            }
    
            const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.date).toEqual(validDueDate)
            expect(response.invoiceDate).toEqual(transactionDate)

            const transaction = await transactionRepository.findById(response.id)
            expect(transaction.date).toEqual(validDueDate)
            expect(transaction.invoiceDate).toEqual(transactionDate)
        })

        test('transactions after closing date should belong to next month\'s invoice', async () => {
            const validClosingDate = new Date('2023-03-03')
            const validDueDate = new Date('2023-04-10')

            const invoiceData: CreditCardInvoiceData = {
                id: 'invoiceId',
                dueDate: validDueDate,
                closeDate: validClosingDate,
                amount: 0,
                userId: userData.id,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }

            const transactionDate = new Date(validClosingDate)
            transactionDate.setDate(transactionDate.getDate() + 1); // 2023-03-04
    
            const transactionRequest = {
                user: userData, 
                account: creditCardAccountData, 
                category: categoryData,
                amount: -4567,
                description,
                date: transactionDate,
                comment,
                ignored,
            }
    
            const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.date).toEqual(validDueDate)
            expect(response.invoiceDate).toEqual(transactionDate)

            const transaction = await transactionRepository.findById(response.id)
            expect(transaction.date).toEqual(validDueDate)
            expect(transaction.invoiceDate).toEqual(transactionDate)
        })
        
        test('transactions before closing date should belong to current month\'s invoice', async () => {
            const validClosingDate = new Date('2023-03-03')
            const validDueDate = new Date('2023-03-10')

            const invoiceData: CreditCardInvoiceData = {
                id: 'invoiceId',
                dueDate: validDueDate,
                closeDate: validClosingDate,
                amount: 0,
                userId: userData.id,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }

            const transactionDate = new Date(validClosingDate)
            transactionDate.setDate(transactionDate.getDate() - 1); // 2023-03-02
    
            const transactionRequest = {
                user: userData, 
                account: creditCardAccountData, 
                category: categoryData,
                amount: -4567,
                description,
                date: transactionDate,
                comment,
                ignored,
            }
    
            const creditCardInvoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData])
            const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([])
            const sut = new AddManualTransactionToCreditCard(accountRepository, transactionRepository, creditCardInvoiceRepository)
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            expect(response.date).toEqual(validDueDate)
            expect(response.invoiceDate).toEqual(transactionDate)

            const transaction = await transactionRepository.findById(response.id)
            expect(transaction.date).toEqual(validDueDate)
            expect(transaction.invoiceDate).toEqual(transactionDate)
        })

    })
})