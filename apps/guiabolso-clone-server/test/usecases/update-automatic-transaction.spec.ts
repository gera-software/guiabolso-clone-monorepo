import { InvalidAccountError } from "@/entities/errors"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors"
import { UserData, CategoryData, BankAccountData, CreditCardAccountData, MetaTransactionRequest, TransactionData, CreditCardInvoiceData } from "@/usecases/ports"
import { UpdateAutomaticTransaction } from "@/usecases/update-automatic-transaction"
import { InMemoryUserRepository, InMemoryAccountRepository, InMemoryTransactionRepository, InMemoryCategoryRepository, InMemoryCreditCardInvoiceRepository } from "@test/doubles/repositories"

describe('Update automatic transaction from account use case', () => {
    const transactionId = 'valid id'
    const userId = 'u0'
    const categoryId = 'c0'
    const amount = -5060
    const description = 'valid description'
    const descriptionOriginal = 'valid original description'
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

    const bankAccountId = 'bac0'
    const bankAccountType = 'BANK'
    const creditCardAccountId = 'cca0'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'AUTOMATIC'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000

    let bankAccountData: BankAccountData
    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        bankAccountData = {
            id: bankAccountId,
            type: bankAccountType,
            syncType,
            name: 'valid bank account',
            balance,
            imageUrl,
            userId,
        }

        creditCardAccountData = {
            id: creditCardAccountId,
            type: creditCardAccountType,
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

    test('should not update if transaction not found', async () => {
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId,
            description,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredTransactionError)
    })

    test('should not update if account is not found', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType,
            userId,
            description,
            descriptionOriginal,
            amount,
            date,
            type: 'INCOME',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId,
            description,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not update if user is not found', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType,
            userId,
            description,
            descriptionOriginal,
            amount,
            date,
            type: 'INCOME',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId,
            description,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not update if account is not of sync type AUTOMATIC', async () => {
        bankAccountData = {
            id: bankAccountId,
            type: bankAccountType,
            syncType: 'MANUAL',
            name: 'valid bank account',
            balance,
            imageUrl,
            userId,
        }

        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType,
            userId,
            description,
            descriptionOriginal,
            amount,
            date,
            type: 'INCOME',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId,
            description,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
        expect(response.message).toBe('Operação não permitida')
    })

    test('should not update if new category is not found', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType,
            userId,
            description,
            descriptionOriginal,
            amount,
            date,
            type: 'INCOME',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId: 'invalid',
            description,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredCategoryError)
    })

    test('should not return error when transaction doesnt have a category', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType,
            userId,
            description,
            descriptionOriginal,
            amount,
            date,
            type: 'INCOME',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            // categoryId,
            description,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value
        expect(response).not.toBeInstanceOf(Error)
    })

    test('should update bank transaction', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType,
            userId,
            description: 'old description',
            descriptionOriginal: 'original',
            amount: 400,
            date: new Date('2023-02-16'),
            type: 'INCOME',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId,
            description: 'new description',
            comment: 'new comment',
            ignored: true,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData

        const updated = await transactionRepository.findById(transactionId)
        expect(updated.description).toBe('new description')
        expect(updated.comment).toEqual('new comment')
        expect(updated.ignored).toEqual(true)
        expect(updated.category.id).toBe(categoryId)
        
        expect(updated.amount).toBe(400)
        expect(updated.type).toBe('INCOME')
        expect(updated.descriptionOriginal).toBe('original')
        expect(updated.date).toEqual(new Date('2023-02-16'))
        
       
    })

    test('should update credit card transaction', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: creditCardAccountId,
            accountType: creditCardAccountType,
            syncType,
            userId,
            description: 'old description',
            descriptionOriginal: 'original',
            amount: -400,
            date: new Date('2023-03-10'),
            invoiceDate: new Date('2023-02-17'),
            invoiceId: 'invoiceId1',
            type: 'EXPENSE',
            category: categoryData1,
        }
        
        const transactionRequest: MetaTransactionRequest = {
            id: transactionId,
            categoryId,
            description: 'new description',
            comment: 'new comment',
            ignored: true,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData

        const updated = await transactionRepository.findById(transactionId)
        expect(updated.description).toBe('new description')
        expect(updated.comment).toEqual('new comment')
        expect(updated.ignored).toEqual(true)
        expect(updated.category.id).toBe(categoryId)

        expect(updated.amount).toBe(-400)
        expect(updated.type).toBe('EXPENSE')
        expect(updated.descriptionOriginal).toBe('original')
        expect(updated.date).toEqual(new Date('2023-03-10'))
        expect(updated.invoiceDate).toEqual(new Date('2023-02-17'))
        expect(updated.invoiceId).toBe('invoiceId1')
        
       
    })

    test('should update category of credit card transaction to "Pagamento de cartão" and update invoice total amount', async () => {
        const pagamentoFaturaCategory: CategoryData = {
            name: "Pagamento de cartão",
            group: "Lançamentos entre contas",
            iconName: "BankPostingsCreditCard",
            primaryColor: "#4C4C4C",
            ignored: true,
            id: "pc",
        }

        const invoiceData1: CreditCardInvoiceData = {
            id: 'invoiceId1',
            closeDate: new Date('2023-03-03'),
            dueDate: new Date('2023-03-10'),
            amount: -20000,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactions = [
            {
                id: 'transaction0',
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description: 'description',
                descriptionOriginal: 'pagamento de fatura recebido',
                amount: 40000,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceData1.id,
                type: 'INCOME',
                category: categoryData1,
            },
            {
                id: 'transaction1',
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description: 'description',
                descriptionOriginal: 'compra',
                amount: -40000,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceData1.id,
                type: 'EXPENSE',
                category: categoryData1,
            },
            {
                id: 'transaction2',
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description: 'description',
                descriptionOriginal: 'outra compra',
                amount: -20000,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceData1.id,
                type: 'EXPENSE',
                category: categoryData1,
            },
        ]

        const transactionRequest: MetaTransactionRequest = {
            id: 'transaction0',
            categoryId: pagamentoFaturaCategory.id,
            description: 'Pagamento de fatura',
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository(transactions)
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1, pagamentoFaturaCategory])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData1])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData

        const updated = await transactionRepository.findById('transaction0')

        expect(updated.category.id).toBe(pagamentoFaturaCategory.id)
        expect(updated.date).toEqual(new Date('2023-03-10'))
        expect(updated.invoiceDate).toEqual(new Date('2023-02-17'))
        expect(updated.invoiceId).toBe('invoiceId1')

        const invoice = await invoiceRepository.findById('invoiceId1')
        expect(invoice.amount).toBe(-60000)
       
    })

    test('should update cateogry from "Pagamento de cartão" to another category and update invoice total amount', async () => {
        const pagamentoFaturaCategory: CategoryData = {
            name: "Pagamento de cartão",
            group: "Lançamentos entre contas",
            iconName: "BankPostingsCreditCard",
            primaryColor: "#4C4C4C",
            ignored: true,
            id: "pc",
        }

        const invoiceData1: CreditCardInvoiceData = {
            id: 'invoiceId1',
            closeDate: new Date('2023-03-03'),
            dueDate: new Date('2023-03-10'),
            amount: -60000,
            userId: userData.id,
            accountId: creditCardAccountData.id,
            _isDeleted: false
        }

        const transactions = [
            {
                id: 'transaction0',
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description: 'description',
                descriptionOriginal: 'pagamento de fatura recebido',
                amount: 40000,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceData1.id,
                type: 'INCOME',
                category: pagamentoFaturaCategory,
            },
            {
                id: 'transaction1',
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description: 'description',
                descriptionOriginal: 'compra',
                amount: -40000,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceData1.id,
                type: 'EXPENSE',
                category: categoryData1,
            },
            {
                id: 'transaction2',
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description: 'description',
                descriptionOriginal: 'outra compra',
                amount: -20000,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceData1.id,
                type: 'EXPENSE',
                category: categoryData1,
            },
        ]

        const transactionRequest: MetaTransactionRequest = {
            id: 'transaction0',
            categoryId: categoryData1.id,
            description: 'não é Pagamento de fatura',
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository(transactions)
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1, pagamentoFaturaCategory])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData1])
        const sut = new UpdateAutomaticTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, invoiceRepository)
        const response = (await sut.perform(transactionRequest)).value as TransactionData

        const updated = await transactionRepository.findById('transaction0')

        expect(updated.category.id).toBe(categoryData1.id)
        expect(updated.date).toEqual(new Date('2023-03-10'))
        expect(updated.invoiceDate).toEqual(new Date('2023-02-17'))
        expect(updated.invoiceId).toBe('invoiceId1')

        const invoice = await invoiceRepository.findById('invoiceId1')
        expect(invoice.amount).toBe(-20000)
       
    })
})