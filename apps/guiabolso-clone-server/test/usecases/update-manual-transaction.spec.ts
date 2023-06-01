import { InvalidAccountError } from "@/entities/errors"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, TransactionRequest, UserData, WalletAccountData } from "@/usecases/ports"
import { UpdateManualTransaction } from "@/usecases/update-manual-transaction"
import { UpdateManualTransactionFromBank } from "@/usecases/update-manual-transaction-from-bank"
import { UpdateManualTransactionFromCreditCard } from "@/usecases/update-manual-transaction-from-credit-card"
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet"
import { InMemoryAccountRepository, InMemoryCategoryRepository, InMemoryCreditCardInvoiceRepository, InMemoryTransactionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Update manual transaction from account use case', () => {
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

    
    const walletAccountId = 'wac0'
    const walletAccountType = 'WALLET'
    const bankAccountId = 'bac0'
    const bankAccountType = 'BANK'
    const creditCardAccountId = 'cca0'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'MANUAL'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000

    let walletAccountData: WalletAccountData
    let bankAccountData: BankAccountData
    let creditCardAccountData: CreditCardAccountData

    beforeEach(() => {
        walletAccountData = {
            id: walletAccountId,
            type: walletAccountType,
            syncType,
            name: 'valid wallet account',
            balance,
            imageUrl,
            userId,
        }
        
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
        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: walletAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)        
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredTransactionError)
    })

    test('should not update if user is not found', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: walletAccountId,
            accountType: walletAccountType,
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
            accountId: walletAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)   
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not update if account is not found', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: walletAccountId,
            accountType: walletAccountType,
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
            accountId: walletAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)   
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredAccountError)
    })

    test('should not update if account is not of sync type MANUAL', async () => {
        bankAccountData = {
            id: bankAccountId,
            type: bankAccountType,
            syncType: 'AUTOMATIC',
            name: 'valid bank account',
            balance,
            imageUrl,
            userId,
        }

        const transactionData: TransactionData = {
            id: transactionId,
            accountId: bankAccountId,
            accountType: bankAccountType,
            syncType: 'AUTOMATIC',
            userId,
            description,
            amount,
            date,
            type: 'INCOME',
            category: categoryData1,
        }

        const transactionRequest: TransactionRequest = {
            id: transactionId,
            accountId: bankAccountId,
            categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)   
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidAccountError)
        expect(response.message).toEqual('Operação não permitida')
    })

    test('should not update if new category is not found', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: walletAccountId,
            accountType: walletAccountType,
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
            accountId: walletAccountId,
            categoryId: 'invalid',
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)         
        const response = (await sut.perform(transactionRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredCategoryError)
    })

    test('should not return error when transaction doesnt have a category', async () => {
        const transactionData: TransactionData = {
            id: transactionId,
            accountId: walletAccountId,
            accountType: walletAccountType,
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
            accountId: walletAccountId,
            // categoryId,
            amount,
            description,
            date,
            comment,
            ignored,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
        const transactionRepository = new InMemoryTransactionRepository([transactionData])
        const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
        const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
        const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
        const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
        const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

        const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)          
        const response = (await sut.perform(transactionRequest)).value
        expect(response).not.toBeInstanceOf(Error)
    })

    describe('update manual transaction from wallet account', () => {

        test('should update transaction and update account balance', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: walletAccountId,
                accountType: walletAccountType,
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
                accountId: walletAccountId,
                categoryId,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
            const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)
    
            const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)               
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            
            const updated = await transactionRepository.findById(transactionId)
            expect(updated.amount).toBe(-400)
            expect(updated.type).toBe('EXPENSE')
            expect(updated.description).toBe('new description')
            expect(updated.date).toEqual(new Date('2023-04-10'))
            expect(updated.comment).toEqual('new comment')
            expect(updated.ignored).toEqual(true)
            expect(updated.category.id).toBe(categoryId)
            const newBalance = (await accountRepository.findById(walletAccountId)).balance
            expect(newBalance).toBe(balance - amount + transactionRequest.amount)
        })
    })

    describe('update manual transaction from bank account', () => {

        test('should update transaction and update account balance', async () => {
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: bankAccountId,
                accountType: bankAccountType,
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
                accountId: bankAccountId,
                categoryId,
                amount: -400,
                description: 'new description',
                date: new Date('2023-04-10'),
                comment: 'new comment',
                ignored: true,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
            const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)
    
            const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)            
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            
            const updated = await transactionRepository.findById(transactionId)
            expect(updated.amount).toBe(-400)
            expect(updated.type).toBe('EXPENSE')
            expect(updated.description).toBe('new description')
            expect(updated.date).toEqual(new Date('2023-04-10'))
            expect(updated.comment).toEqual('new comment')
            expect(updated.ignored).toEqual(true)
            expect(updated.category.id).toBe(categoryId)
            const newBalance = (await accountRepository.findById(bankAccountId)).balance
            expect(newBalance).toBe(balance - amount + transactionRequest.amount)
        })
    })

    describe('update manual transaction from credit card account', () => {

        test('should update transaction, update invoice and account balance', async () => {
            const invoiceId1 = 'valid invoice 1'
            const invoiceId2 = 'valid invoice 2'
            const oldExpense = -5678
            const newExpense = -1234
            const newDescription = 'new description'
            const newComment = 'new comment'
            const newDate = new Date('2023-01-17')
    
            const invoiceData1: CreditCardInvoiceData = {
                id: invoiceId1,
                dueDate: new Date('2023-03-10'),
                closeDate: new Date('2023-03-03'),
                amount: oldExpense,
                userId: userData.id,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }
            const invoiceData2: CreditCardInvoiceData = {
                id: invoiceId2,
                dueDate: new Date('2023-02-10'),
                closeDate: new Date('2023-02-03'),
                amount: 0,
                userId: userData.id,
                accountId: creditCardAccountData.id,
                _isDeleted: false
            }
    
            const transactionData: TransactionData = {
                id: transactionId,
                accountId: creditCardAccountId,
                accountType: creditCardAccountType,
                syncType,
                userId,
                description,
                amount: oldExpense,
                date: new Date('2023-03-10'),
                invoiceDate: new Date('2023-02-17'),
                invoiceId: invoiceId1,
                type: 'EXPENSE'
            }
    
            const transactionRequest: TransactionRequest = {
                id: transactionId,
                accountId: creditCardAccountId,
                categoryId: categoryData.id,
                amount: newExpense,
                description: newDescription,
                date: newDate,
                comment: newComment,
                ignored: true,
            }

            const userRepository = new InMemoryUserRepository([userData])
            const accountRepository = new InMemoryAccountRepository([walletAccountData, bankAccountData, creditCardAccountData])
            const transactionRepository = new InMemoryTransactionRepository([transactionData])
            const invoiceRepository = new InMemoryCreditCardInvoiceRepository([invoiceData1, invoiceData2])
            const categoryRepository = new InMemoryCategoryRepository([categoryData, categoryData1])
            const updateManualTransactionFromWallet = new UpdateManualTransactionFromWallet(transactionRepository, accountRepository)
            const updateManualTransactionFromBank = new UpdateManualTransactionFromBank(transactionRepository, accountRepository)
            const updateManualTransactionFromCreditCard = new UpdateManualTransactionFromCreditCard(transactionRepository, accountRepository, invoiceRepository)

            const sut = new UpdateManualTransaction(userRepository, accountRepository, transactionRepository, categoryRepository, updateManualTransactionFromWallet, updateManualTransactionFromBank, updateManualTransactionFromCreditCard)            
            const response = (await sut.perform(transactionRequest)).value as TransactionData
            
            const updated = await transactionRepository.findById(transactionId)
            expect(updated.amount).toBe(newExpense)
            expect(updated.description).toBe(newDescription)
            expect(updated.comment).toBe(newComment)
            expect(updated.ignored).toBe(true)
            expect(updated.date).toEqual(invoiceData2.dueDate)
            expect(updated.invoiceDate).toEqual(newDate)
            expect(updated.invoiceId).toBe(invoiceId2)
            expect(updated.category.id).toBe(categoryData.id)

            const oldInvoice = await invoiceRepository.findById(invoiceId1)
            expect(oldInvoice.amount).toBe(0)
    
            const newInvoice = await invoiceRepository.findById(invoiceId2)
            expect(newInvoice.amount).toBe(newExpense)
    
            const account = await accountRepository.findById(creditCardAccountData.id)
            expect(account.balance).toBe(oldInvoice.amount)
            expect(account.creditCardInfo.availableCreditLimit).toBe(availableCreditLimit - oldExpense + newExpense)
        })
    })

})