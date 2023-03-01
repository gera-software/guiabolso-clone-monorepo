import { MongodbAccountRepository, MongodbUserRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { AccountData, UserData } from "@/usecases/ports"

describe('Mongodb Account repository', () => {
    const userRepo = new MongodbUserRepository()
    let validUser: UserData

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        const user = {
            name: 'any_name',
            email: 'any@mail.com',
            password: '123',
        }
        validUser = await userRepo.add(user)
    })
    
    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.disconnect()
    })
    
    beforeEach(async () => {
        await MongoHelper.clearCollection('accounts')
        // await MongoHelper.clearCollection('users')
    })

    test('when account is added, it should exist', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'WALLET',
            name: 'any name',
            balance: 789,
            userId: validUser.id
        }
        const addedAccount = await sut.add(account)
        expect(addedAccount.userId).toBe(validUser.id)
        const exists = await sut.exists(addedAccount.id)
        expect(exists).toBeTruthy()
    })

    test('when an account is not find by id, should return null', async () => {
        const notFoundId = '62f95f4a93d61d8fff971668'
        const sut = new MongodbAccountRepository()
        const result = await sut.findById(notFoundId)
        expect(result).toBeNull()
    })

    test('when an account is find by id, should return the account', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'WALLET',
            name: 'any name',
            balance: 789,
            userId: validUser.id
        }
        const addedAccount = await sut.add(account)

        const result: AccountData = await sut.findById(addedAccount.id) as AccountData
        expect(result).not.toBeNull()
        expect(result.id).toBe(addedAccount.id)
        expect(result.type).toBe(account.type)
        expect(result.name).toBe(account.name)
        expect(result.balance).toBe(account.balance)
        expect(result.userId).toBe(account.userId)
    })
})