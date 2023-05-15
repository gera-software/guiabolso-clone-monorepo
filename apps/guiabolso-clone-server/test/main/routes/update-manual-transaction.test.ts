import request from 'supertest'
import app from '@/main/config/app'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository, makeAccountRepository, makeTransactionRepository, makeCategoryRepository, makeCreditCardInvoiceRepository } from "@/main/factories"
import { BankAccountData, CategoryData, CreditCardAccountData, CreditCardInvoiceData, TransactionData, UserData, WalletAccountData } from "@/usecases/ports"

describe('update manual transaction route', () => {
    const amount = -1294
    const description = 'new valid description'
    const date = new Date('2023-02-09')
    const comment = 'updated comment'
    const ignored = true

    const walletAccountType = 'WALLET'
    const bankAccountType = 'BANK'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'MANUAL'
    const accountName = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000


    let validUser: UserData
    let validWalletAccount: WalletAccountData
    let validBankAccount: BankAccountData
    let validCreditCardAccount: CreditCardAccountData

    let walletTransactionData: TransactionData
    let bankTransactionData: TransactionData
    let creditCardTransactionData: TransactionData

    let category0: CategoryData
    let category1: CategoryData

    let invoiceData1: CreditCardInvoiceData
    let invoiceData2: CreditCardInvoiceData

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.clearCollection('invoices')

        const userRepo = makeUserRepository()
        const accountRepo = makeAccountRepository()
        const transactionRepo = makeTransactionRepository()
        const categoryRepo = makeCategoryRepository()
        const invoiceRepo = makeCreditCardInvoiceRepository()

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })

        validWalletAccount = await accountRepo.add({
            type: walletAccountType,
            syncType: syncType,
            name: accountName,
            balance: 0,
            userId: validUser.id,
        })

        validBankAccount = await accountRepo.add({
            type: bankAccountType,
            syncType: syncType,
            name: accountName,
            balance: 0,
            userId: validUser.id,
        })

        validCreditCardAccount = await accountRepo.add({
            type: creditCardAccountType,
            syncType,
            name: 'valid credit card account',
            balance: 0,
            imageUrl,
            userId: validUser.id,
            creditCardInfo: {
                brand: 'master card',
                creditLimit: 100000,
                availableCreditLimit: availableCreditLimit,
                closeDay: 3,
                dueDay: 10
            }
        })

        const categoryCollection = MongoHelper.getCollection('categories')

        await categoryCollection.insertOne({
            name: "category 0",
            group: "group 0",
            iconName: "icon 0",
            primaryColor: "color 0",
            ignored: true,
        })
        await categoryCollection.insertOne({
            name: "category 1",
            group: "group 1",
            iconName: "icon 1",
            primaryColor: "color 1",
            ignored: true,
        })

        const [ cat0, cat1 ] = await categoryRepo.fetchAll()
        category0 = cat0
        category1 = cat1

        walletTransactionData = await transactionRepo.add({
            accountId: validWalletAccount.id,
            accountType: validWalletAccount.type,
            syncType: validWalletAccount.syncType,
            userId: validUser.id,
            category: category0,
            amount: 2345,
            description: 'valid description',
            descriptionOriginal: '',
            date: new Date('2023-05-18'),
            type: 'INCOME',
            comment: 'valid comment',
            ignored: false,
            _isDeleted: false,
        })

        bankTransactionData = await transactionRepo.add({
            accountId: validBankAccount.id,
            accountType: validBankAccount.type,
            syncType: validBankAccount.syncType,
            userId: validUser.id,
            category: category0,
            amount: 5678,
            description: 'valid description',
            descriptionOriginal: '',
            date: new Date('2023-05-18'),
            type: 'INCOME',
            comment: 'valid comment',
            ignored: false,
            _isDeleted: false,
        })


        const oldExpense = -5678

        invoiceData1 = await invoiceRepo.add({
            dueDate: new Date('2023-03-10'),
            closeDate: new Date('2023-03-03'),
            amount: oldExpense,
            userId: validUser.id,
            accountId: validCreditCardAccount.id,
            _isDeleted: false
        })

        invoiceData2 = await invoiceRepo.add({
            dueDate: new Date('2023-02-10'),
            closeDate: new Date('2023-02-03'),
            amount: 0,
            userId: validUser.id,
            accountId: validCreditCardAccount.id,
            _isDeleted: false
        })

        
        creditCardTransactionData = await transactionRepo.add({
            accountId: validCreditCardAccount.id,
            accountType: validCreditCardAccount.type,
            syncType: validCreditCardAccount.syncType,
            userId: validUser.id,
            category: category0,
            amount: oldExpense,
            description: 'valid description',
            date: new Date('2023-03-10'),
            invoiceDate: new Date('2023-02-17'),
            invoiceId: invoiceData1.id,
            type: 'EXPENSE',
            comment: 'valid comment',
            ignored: false,
            _isDeleted: false,
        })


    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.clearCollection('invoices')
        await MongoHelper.disconnect()

    })

    test('should update a manual transaction from a wallet account', async () => {
        await request(app)
            .put('/api/manual-transaction')
            .send({
                id: walletTransactionData.id,
                accountId: validWalletAccount.id.toString(), 
                categoryId: category1,
                amount, 
                date,
                description,
                comment,
                ignored,
            })
            .expect(200)
            .then((res) => {
                expect(res.body.id).toBeDefined()
                expect(res.body._isDeleted).toBe(false)
                expect(res.body.category.id).toBe(category1.id)
                expect(res.body.amount).toBe(amount)
                expect(res.body.date).toEqual(date.toISOString())
                expect(res.body.description).toBe(description)
                expect(res.body.comment).toBe(comment)
                expect(res.body.ignored).toBe(ignored)
            })
    })

    test('should update a manual transaction from a bank account', async () => {
        await request(app)
            .put('/api/manual-transaction')
            .send({
                id: bankTransactionData.id,
                accountId: validBankAccount.id.toString(), 
                categoryId: category1,
                amount, 
                date,
                description,
                comment,
                ignored,
            })
            .expect(200)
            .then((res) => {
                expect(res.body.id).toBeDefined()
                expect(res.body._isDeleted).toBe(false)
                expect(res.body.category.id).toBe(category1.id)
                expect(res.body.amount).toBe(amount)
                expect(res.body.date).toEqual(date.toISOString())
                expect(res.body.description).toBe(description)
                expect(res.body.comment).toBe(comment)
                expect(res.body.ignored).toBe(ignored)
            })
    })

    test('should update a manual transaction from a credit card account', async () => {
        const newDate = new Date('2023-01-17')

        await request(app)
            .put('/api/manual-transaction')
            .send({
                id: creditCardTransactionData.id,
                accountId: validCreditCardAccount.id.toString(), 
                categoryId: category1,
                amount, 
                date: newDate,
                description,
                comment,
                ignored,
            })
            .expect(200)
            .then((res) => {
                expect(res.body.id).toBeDefined()
                expect(res.body._isDeleted).toBe(false)
                expect(res.body.category.id).toBe(category1.id)
                expect(res.body.amount).toBe(amount)
                expect(res.body.date).toEqual(invoiceData2.dueDate.toISOString())
                expect(res.body.invoiceDate).toEqual(newDate.toISOString())
                expect(res.body.invoiceId).toBe(invoiceData2.id)
                expect(res.body.description).toBe(description)
                expect(res.body.comment).toBe(comment)
                expect(res.body.ignored).toBe(ignored)
            })
    })
})