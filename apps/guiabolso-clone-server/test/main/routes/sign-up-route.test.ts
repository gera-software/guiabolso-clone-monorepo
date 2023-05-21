import request from 'supertest'
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import app from '@/main/config/app'

describe('Signup route', () => {
    beforeAll(async () => {
      await MongoHelper.connect(process.env.MONGO_URL ?? '')
      await MongoHelper.clearCollection('users')
    })
  
    afterAll(async () => {
      await MongoHelper.clearCollection('users')
      await MongoHelper.disconnect()
    })

    test('should return access token info and user data on success', async () => {
        await request(app)
          .post('/api/signup')
          .send({
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword'
          })
          .expect(201)
          .then((res) => {
            expect(res.body.accessToken).toBeDefined()
            expect(res.body.iat).toBeDefined()
            expect(res.body.exp).toBeDefined()
            expect(res.body.data.id).toBeDefined()
            expect(res.body.data.email).toBeDefined()
            expect(res.body.data.name).toBeDefined()
          })
      })
})