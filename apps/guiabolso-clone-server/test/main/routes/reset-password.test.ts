import request from 'supertest'
import app from '@/main/config/app'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeUserRepository, makeTokenManager } from "@/main/factories"
import { UserData } from "@/usecases/ports"
import { ResetPasswordPayloadData } from "@/usecases/send-password-reset-token/ports"

describe('Reset password route', () => {
    let userData: UserData
    let passwordResetToken: string

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

        const payload: ResetPasswordPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        passwordResetToken = await tokenManager.sign(payload, sixHours)
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.disconnect()
    })

    test('should update password', async () => {
        await request(app)
          .post('/api/reset-password')
          .send({
            token: passwordResetToken,
            password: 'new-password',
          })
          .expect(204)
    })
})