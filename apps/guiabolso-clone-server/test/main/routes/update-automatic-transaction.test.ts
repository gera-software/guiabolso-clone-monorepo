import request from 'supertest'
import app from '@/main/config/app'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository, makeAccountRepository, makeTransactionRepository, makeCategoryRepository, makeCreditCardInvoiceRepository } from "@/main/factories"
import { UserData, CategoryData, WalletAccountData, BankAccountData, CreditCardAccountData, CreditCardInvoiceData, TransactionData } from "@/usecases/ports"
import { ObjectId } from "mongodb"

describe('update automatic transaction route', () => {

    const description = 'valid description'
    const comment = 'valid comment'
    const ignored = false

    const bankAccountType = 'BANK'
    const creditCardAccountType = 'CREDIT_CARD'
    const syncType = 'AUTOMATIC'
    const imageUrl = 'valid image url'
    const availableCreditLimit = 100000

    let validUser: UserData
    let validBankAccount: BankAccountData
    let validCreditCardAccount: CreditCardAccountData

    let bankTransactionData: TransactionData
    let creditCardTransactionData: TransactionData

    let category0: CategoryData
    let category1: CategoryData



    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.clearCollection('credit_card_invoices')

        const userRepo = makeUserRepository()
        const accountRepo = makeAccountRepository()
        const transactionRepo = makeTransactionRepository()
        const categoryRepo = makeCategoryRepository()

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })

        validBankAccount = await accountRepo.add({
            type: bankAccountType,
            syncType: syncType,
            name: 'valid bank account',
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

        creditCardTransactionData = await transactionRepo.add({
            accountId: validCreditCardAccount.id,
            accountType: validCreditCardAccount.type,
            syncType: validCreditCardAccount.syncType,
            userId: validUser.id,
            category: category0,
            amount: -300,
            description: 'valid description',
            date: new Date('2023-03-10'),
            invoiceDate: new Date('2023-02-17'),
            invoiceId: new ObjectId().toString(),
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
        await MongoHelper.clearCollection('credit_card_invoices')
        await MongoHelper.disconnect()

    })

    test('should update an automatic transaction from a bank account', async () => {
        await request(app)
        .put('/api/automatic-transaction')
        .send({
            id: bankTransactionData.id,
            // accountId: validBankAccount.id.toString(), 
            categoryId: category1,
            // amount, 
            // date,
            description,
            comment,
            ignored,
        })
        .expect(200)
        .then((res) => {
            expect(res.body.id).toBeDefined()
            // expect(res.body._isDeleted).toBe(false)
            expect(res.body.category.id).toBe(category1.id)
            // expect(res.body.amount).toBe(amount)
            // expect(res.body.date).toEqual(date.toISOString())
            expect(res.body.description).toBe(description)
            expect(res.body.comment).toBe(comment)
            expect(res.body.ignored).toBe(ignored)
        })
    })

    test('should update an automatic transaction from a credit card account', async () => {
        await request(app)
        .put('/api/automatic-transaction')
        .send({
            id: creditCardTransactionData.id,
            // accountId: validBankAccount.id.toString(), 
            categoryId: category1,
            // amount, 
            // date,
            description,
            comment,
            ignored,
        })
        .expect(200)
        .then((res) => {
            expect(res.body.id).toBeDefined()
            // expect(res.body._isDeleted).toBe(false)
            expect(res.body.category.id).toBe(category1.id)
            // expect(res.body.amount).toBe(amount)
            // expect(res.body.date).toEqual(date.toISOString())
            expect(res.body.description).toBe(description)
            expect(res.body.comment).toBe(comment)
            expect(res.body.ignored).toBe(ignored)
        })
    })
})