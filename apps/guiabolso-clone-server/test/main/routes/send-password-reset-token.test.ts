import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeEncoder, makeUserRepository } from "@/main/factories"
import { UserData } from "@/usecases/ports"
import request from 'supertest'
import app from '@/main/config/app'

describe('Send reset password token route', () => {
    const validUser: UserData = {
        name: "valid name",
        email: "valid@email.com",
        isVerified: true,
        password: "valid"
    }

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        const userRepo = makeUserRepository()
        const encoder = makeEncoder()

        await userRepo.add({
            name: validUser.name,
            email: validUser.email,
            password: await encoder.encode(validUser.password),
            isVerified: true,
        })
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.disconnect()
    })

    test('should successfully request reset token', async () => {
        await request(app)
            .post('/api/password-reset-token')
            .send({
                email: validUser.email
            })
            .expect(204)
    })
})