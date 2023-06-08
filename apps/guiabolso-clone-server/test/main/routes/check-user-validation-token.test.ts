import request from 'supertest'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import app from '@/main/config/app'
import { UserData } from '@/usecases/ports'
import { makeTokenManager, makeUserRepository } from '@/main/factories'
import { EmailValidationPayloadData } from '@/usecases/send-user-validation-token/ports'

describe('Check user validation token route', () => {
    let userData: UserData
    let emailValidationToken: string

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')

        const userRepo = makeUserRepository()
        const tokenManager = makeTokenManager()

        userData = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            isVerified: false,
            password: "valid"
        })

        const payload: EmailValidationPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        emailValidationToken = await tokenManager.sign(payload, sixHours)
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.disconnect()
    })

    test('should validate user email token', async () => {
        await request(app)
          .post(`/api/validate-email?t=${emailValidationToken}`)
          .expect(200)
      })
})