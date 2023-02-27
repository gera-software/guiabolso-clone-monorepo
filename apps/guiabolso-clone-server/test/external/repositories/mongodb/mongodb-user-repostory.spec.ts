import { MongodbUserRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"

describe('Mongodb User repository', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL ?? '')
      })
    
      afterAll(async () => {
        await MongoHelper.disconnect()
      })
    
      beforeEach(async () => {
        await MongoHelper.clearCollection('users')
    })

    test('when user is added, it should exist', async () => {
        const sut = new MongodbUserRepository()
        const user = {
          name: 'any_name',
          email: 'any@mail.com',
          password: '123',
        }
        await sut.add(user)
        expect(await sut.exists(user)).toBeTruthy()
      })
})