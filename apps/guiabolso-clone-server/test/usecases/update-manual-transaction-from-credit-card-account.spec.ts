import { InvalidTransactionError } from "@/entities/errors"
import { CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, UserData } from "@/usecases/ports"
import { UpdateManualTransactionFromCreditCard } from "@/usecases/update-manual-transaction-from-credit-card"
import { TransactionToUpdateData } from "@/usecases/update-manual-transaction/ports"
import { InMemoryAccountRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository } from "@test/doubles/repositories"

describe('update manual transaction from credit card account use case', () => {
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

    const categoryData0: CategoryData = {
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
            name,
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

    test('should not update transaction without description', async () => {
        const invoiceId1 = 'valid invoice 1'
        const invoiceId2 = 'valid invoice 2'

        const invoiceData1: CreditCardInvoiceData = {
            id: invoiceId1,
            dueDate: new Date('2023-03-10'),
            closeDate: new Date('2023-03-03'),
            amount: amount,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }
        const invoiceData2: CreditCardInvoiceData = {
            id: invoiceId2,
            dueDate: new Date('2023-02-10'),
            closeDate: new Date('2023-02-03'),
            amount: amount,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactionData: TransactionData = {
            id: transactionId,
            accountId,
            accountType,
            syncType,
            userId,
            description,
            amount,
            date: new Date('2023-03-10'),
            invoiceDate: new Date('2023-02-17'),
            invoiceId: invoiceId1,
            type: 'EXPENSE'
        }

        const request: TransactionToUpdateData = {
            oldTransactionData: transactionData,
            newTransaction: {
                user: userData,
                account: creditCardAccountData,
                category: categoryData0,
                amount,
                // description,
                date: new Date('2023-01-17'),
                comment,
                ignored,
            },
        }

        const accountRepository = new InMemoryAccountRepository([creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData1, invoiceData2])
        const sut = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)
        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidTransactionError)
    })
})