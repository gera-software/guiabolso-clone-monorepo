import { MongodbUserRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { UserData } from "@/usecases/ports"

describe('Mongodb User repository', () => {
    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL ?? '')
      })
    
      afterAll(async () => {
        await MongoHelper.clearCollection('users')
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
          isVerified: false,
        }
        await sut.add(user)
        expect(await sut.exists(user)).toBeTruthy()
    })

    test('when a user is not find by email, should return null', async () => {
        const sut = new MongodbUserRepository()
        const result = await sut.findUserByEmail('any@mail.com')
        expect(result).toBeNull()
    })

    test('if a user is find by email, should return the user', async () => {
        const sut = new MongodbUserRepository()
        const user = {
          name: 'any_name',
          email: 'any@mail.com',
          password: '123',
          isVerified: true,
        }
        await sut.add(user)

        const result: UserData = await sut.findUserByEmail('any@mail.com') as UserData
        expect(result).not.toBeNull()
        expect(result.name).toBe(user.name)
        expect(result.email).toBe('any@mail.com')
        expect(result.password).toBe('123')
        expect(result.isVerified).toBe(true)
        expect(result.id).toBeTruthy()
    })

    test('when a user is not find by id, should return null', async () => {
      const sut = new MongodbUserRepository()
      const result = await sut.findUserById('62f95f4a93d61d8fff971668')
      expect(result).toBeNull()
    })

    test('if a user is find by id, should return the user', async () => {
      const sut = new MongodbUserRepository()
      const user = {
        name: 'any_name',
        email: 'any@mail.com',
        password: '123',
        isVerified: false,
      }
      const addedUser = await sut.add(user)

      const result: UserData = await sut.findUserById(addedUser.id) as UserData
      expect(result).not.toBeNull()
      expect(result.name).toBe(user.name)
      expect(result.email).toBe('any@mail.com')
      expect(result.password).toBe('123')
      expect(result.isVerified).toBe(false)
      expect(result.id).toBe(addedUser.id)
  })

  test('should set user as verified', async () => {
    const sut = new MongodbUserRepository()
    const user = {
      name: 'any_name',
      email: 'any@mail.com',
      password: '123',
      isVerified: false,
    }
    const addedUser = await sut.add(user)
    expect(addedUser.isVerified).toBe(false)

    await sut.verifyEmail(addedUser.id)
    
    const verifiedUser = await sut.findUserById(addedUser.id)
    expect(verifiedUser.isVerified).toBe(true)

  })

  test('should update password', async () => {
    const sut = new MongodbUserRepository()
    const user = {
      name: 'any_name',
      email: 'any@mail.com',
      password: '123',
      isVerified: true,
    }
    const addedUser = await sut.add(user)

    const newPassword = 'new-password'
    await sut.updatePassword(addedUser.id, newPassword)
    
    const updatedUser = await sut.findUserById(addedUser.id)
    expect(updatedUser.password).toBe(newPassword)

  })

})