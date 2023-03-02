import request from 'supertest'
import app from '@/main/config/app'

import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository } from "@/main/factories"
import { UserData } from "@/usecases/ports"

describe('create manual wallet account route', () => {

    const userRepo = makeUserRepository()
    let validUser: UserData

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.disconnect()
    })


    test('should create a manual wallet account for a valid user', async () => {
        await request(app)
            .post('/api/create/manual-wallet')
            .send({
                type: 'WALLET',
                name: 'valid name',
                balance: 897,
                imageUrl: 'url',
                userId: validUser.id,
            })
            .expect(201)
            .then((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.type).toBe('WALLET')
            })
    })
})