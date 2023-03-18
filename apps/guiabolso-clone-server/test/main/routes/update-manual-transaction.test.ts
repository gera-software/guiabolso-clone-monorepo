import request from 'supertest'
import app from '@/main/config/app'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository, makeAccountRepository, makeTransactionRepository, makeCategoryRepository } from "@/main/factories"
import { CategoryData, TransactionData, UserData, WalletAccountData } from "@/usecases/ports"

describe('update manual transaction route', () => {
    const amount = -1294
    const description = 'new valid description'
    const date = new Date('2023-02-09')
    const comment = 'updated comment'
    const ignored = true


    
    const accountType = 'WALLET'
    const syncType = 'MANUAL'
    const accountName = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'


    let validUser: UserData
    let validWalletAccount: WalletAccountData
    let transactionData: TransactionData
    let category0: CategoryData
    let category1: CategoryData

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')

        const userRepo = makeUserRepository()
        const accountRepo = makeAccountRepository()
        const transactionRepo = makeTransactionRepository()
        const categoryRepo = makeCategoryRepository()
        

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })

        validWalletAccount = await accountRepo.add({
            type: accountType,
            syncType: syncType,
            name: accountName,
            balance: 0,
            userId: validUser.id,
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

        transactionData = await transactionRepo.add({
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
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.disconnect()

    })

    test('should update a manual transaction from a wallet account', async () => {
        await request(app)
            .put('/api/manual-transaction')
            .send({
                id: transactionData.id,
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
})