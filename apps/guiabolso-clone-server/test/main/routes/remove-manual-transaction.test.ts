import request from 'supertest'
import app from '@/main/config/app'
import { MongodbCategory } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository, makeAccountRepository, makeTransactionRepository } from "@/main/factories"
import { TransactionData, UserData, WalletAccountData } from "@/usecases/ports"

describe('remove manual transaction route', () => {
    const amount = -5060
    const description = 'valid description'
    const date = new Date('2023-03-09')
    const comment = 'valid comment'
    const ignored = false

    const category0: MongodbCategory = {
        name: "category 0",
        group: "group 0",
        iconName: "icon 0",
        primaryColor: "color 0",
        ignored: true,
        _id: null,
    }
    
    const accountType = 'WALLET'
    const syncType = 'MANUAL'
    const accountName = 'valid account'
    const balance = 678
    const imageUrl = 'valid image url'


    let validUser: UserData
    let validWalletAccount: WalletAccountData
    let transactionData: TransactionData

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

        // const categoryCollection = MongoHelper.getCollection('categories')
        // await categoryCollection.insertOne(category0)

        transactionData = await transactionRepo.add({
            accountId: validWalletAccount.id,
            accountType: validWalletAccount.type,
            syncType: validWalletAccount.syncType,
            userId: validUser.id,
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

    test('should remove a manual transaction from a wallet account', async () => {
        await request(app)
            .delete('/api/manual-transaction')
            .send({
                id: transactionData.id
            })
            .expect(200)
    })
})