import request from "supertest"
import app from "@/main/config/app"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository } from "@/main/factories"
import { PluggyDataProvider } from '@/external/financial-data-provider'
import { AccountData, UserData } from "@/usecases/ports"
import { right } from "@/shared"

jest.mock('@/external/financial-data-provider')
const mockedDataProvider = jest.mocked(PluggyDataProvider)

describe('connect automatic accounts route', () => {
    const userRepo = makeUserRepository()
    let validUser: UserData

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('institutions')

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.disconnect()
    })

    test('should create automatic accounts for a valid user', async () => {
        const validItemId = "a5d1ca6c-24c0-41c7-8b44-9272cc868663"

        const bankAccount: AccountData = {
            "balance": 120950, 
            "creditCardInfo": null, 
            "id": null, 
            "imageUrl": 'image url', 
            "institution": {
                "id": null, 
                "imageUrl": 'image url', 
                "name": 'institution 1', 
                "primaryColor": 'color', 
                "providerConnectorId": '1', 
                "type": "PERSONAL_BANK"
            }, 
            "name": 'bank account', 
            "providerAccountId": "a658c848-e475-457b-8565-d1fffba127c4", 
            "syncType": "AUTOMATIC", 
            "synchronization": {
                "createdAt": new Date("2021-12-28T21:48:02.863Z"), 
                "providerItemId": validItemId
            }, 
            "type": "BANK", 
            "userId": null,
        }

        const creditAccount: AccountData = {
            "balance": -120950, 
            "creditCardInfo": {
                "availableCreditLimit": 200000, 
                "creditLimit": 300000, 
                "brand": "MASTERCARD", 
                "closeDay": 3, 
                "dueDay": 10
            }, 
            "id": null, 
            "imageUrl": "image url", 
            "institution": {
                "id": null, 
                "imageUrl": 'image url', 
                "name": 'institution 1', 
                "primaryColor": 'color', 
                "providerConnectorId": '1', 
                "type": "PERSONAL_BANK"
            }, 
            "name": "credit card account", 
            "providerAccountId": "a658c848-e475-457b-8565-d1fffba127c5", 
            "syncType": "AUTOMATIC", 
            "synchronization": {
                "createdAt": new Date("2021-12-28T21:48:02.863Z"), 
                "providerItemId": validItemId
            }, 
            "type": "CREDIT_CARD", 
            "userId": null,
        }

        mockedDataProvider.prototype.getAccountsByItemId.mockResolvedValueOnce(right([bankAccount, creditAccount]))

        await request(app)
            .post('/api/connect-accounts')
            .send({
                itemId: validItemId,
                userId: validUser.id,
            })
            .expect(201)
            .then((res) => {
                expect(res.body.length).toBe(2)
                expect(res.body[0].providerAccountId).toBe(3)
                expect(res.body[0].synchonization).toBe(4)
            })
    })

})