import request from 'supertest'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeEncoder, makeUserRepository } from "@/main/factories"
import { UserData } from "@/usecases/ports"
import app from '@/main/config/app'

describe('Signin route', () => {

    const validUser: UserData = {
        name: "valid name",
        email: "valid@email.com",
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
            password: await encoder.encode(validUser.password)
        })
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.disconnect()
    })

    test('should successfully sign in with valid user', async () => {
        await request(app)
            .post('/api/signin')
            .send({
                email: validUser.email,
                password: validUser.password
            })
            .expect(200)
            .then((res) => {
                expect(res.body.accessToken).toBeDefined()
                expect(res.body.id).toBeDefined()
            })
    })
})