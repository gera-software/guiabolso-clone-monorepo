import request from 'supertest'
import app from '@/main/config/app'
import { UserData, WalletAccountData } from '@/usecases/ports'
import { MongoHelper } from '@/external/repositories/mongodb/helper'
import { makeAccountRepository, makeUserRepository } from '@/main/factories'
import { MongodbCategory } from '@/external/repositories/mongodb'

describe('add manual transaction route', () => {
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

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')

        const userRepo = makeUserRepository()
        const accountRepo = makeAccountRepository()
        

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
        await categoryCollection.insertOne(category0)
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.disconnect()

    })

    test('should add a manual transaction to a wallet account', async () => {
        await request(app)
            .post('/api/manual-transaction')
            .send({
                accountId: validWalletAccount.id.toString(), 
                categoryId: category0._id.toString(), 
                amount, 
                date,
                description,
                comment,
                ignored,
            })
            .expect(201)
            .then((res) => {
                expect(res.body.id).toBeDefined()
                expect(res.body._isDeleted).toBe(false)
            })
    })
})