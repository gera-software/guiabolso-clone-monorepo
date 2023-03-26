import { MongodbAccountRepository, MongodbInstitution, MongodbInstitutionRepository, MongodbUserRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { AccountData, CreditCardAccountData, CreditCardInfoData, InstitutionData, UserData, WalletAccountData } from "@/usecases/ports"

describe('Mongodb Account repository', () => {
    const userRepo = new MongodbUserRepository()
    const institutionRepo = new MongodbInstitutionRepository()
    let validUser: UserData
    let validInstitution: InstitutionData
    const validCreditCardInfoData: CreditCardInfoData = {
        brand: "master card",
        creditLimit: 100000,
        availableCreditLimit: 50000,
        closeDay: 3,
        dueDay: 10
    }

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        const user = {
            name: 'any_name',
            email: 'any@mail.com',
            password: '123',
        }
        validUser = await userRepo.add(user)

        const institutionsArray: MongodbInstitution[] = [{
            _id: null,
            name: 'institution 0', 
            type: 'PERSONAL_BANK', 
            imageUrl: 'url 0', 
            primaryColor: 'color 0',
            providerConnectorId: 'connector 0'
        }]

        const institutionCollection = MongoHelper.getCollection('institutions')
        await institutionCollection.insertMany(institutionsArray)

        validInstitution = (await institutionRepo.fetchByType('PERSONAL_BANK'))[0]

    })
    
    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
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
            syncType: 'MANUAL',
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

    test('when a wallet account is find by id, should return the account', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'WALLET',
            syncType: 'MANUAL',
            name: 'any name',
            balance: 789,
            userId: validUser.id
        }
        const addedAccount = await sut.add(account)

        const result: AccountData = await sut.findById(addedAccount.id) as AccountData
        expect(result).not.toBeNull()
        expect(result.id).toBe(addedAccount.id)
        expect(result.type).toBe(account.type)
        expect(result.syncType).toBe(account.syncType)
        expect(result.name).toBe(account.name)
        expect(result.balance).toBe(account.balance)
        expect(result.userId).toBe(account.userId)

    })

    test('when a bank account is find by id, should return the account', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'BANK',
            syncType: 'MANUAL',
            name: 'any name',
            balance: 789,
            userId: validUser.id,
            institution: validInstitution,
        }
        const addedAccount = await sut.add(account)

        const result: AccountData = await sut.findById(addedAccount.id) as AccountData
        expect(result).not.toBeNull()
        expect(result.id).toBe(addedAccount.id)
        expect(result.type).toBe(account.type)
        expect(result.syncType).toBe(account.syncType)
        expect(result.name).toBe(account.name)
        expect(result.balance).toBe(account.balance)
        expect(result.userId).toBe(account.userId)
        expect(result.institution).toEqual(validInstitution)
    })

    test('when a credit card account is find by id, should return the account', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'CREDIT_CARD',
            syncType: 'MANUAL',
            name: 'any name',
            balance: 789,
            userId: validUser.id,
            institution: validInstitution,
            creditCardInfo: validCreditCardInfoData,
        }
        const addedAccount = await sut.add(account)

        const result: AccountData = await sut.findById(addedAccount.id) as AccountData
        expect(result).not.toBeNull()
        expect(result.id).toBe(addedAccount.id)
        expect(result.type).toBe(account.type)
        expect(result.syncType).toBe(account.syncType)
        expect(result.name).toBe(account.name)
        expect(result.balance).toBe(account.balance)
        expect(result.userId).toBe(account.userId)
        expect(result.institution).toEqual(validInstitution)
        expect(result.creditCardInfo).toEqual(validCreditCardInfoData)
    })

    test('should update account balance', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'WALLET',
            syncType: 'MANUAL',
            name: 'any name',
            balance: 789,
            userId: validUser.id
        }
        const addedAccount = await sut.add(account)
        
        const newBalance = -5123
        await sut.updateBalance(addedAccount.id, newBalance)

        
        expect((await sut.findById(addedAccount.id)).balance).toBe(newBalance)
    })

    test('should update avaliable credit card limit', async () => {
        const sut = new MongodbAccountRepository()
        const account: CreditCardAccountData = {
            type: 'CREDIT_CARD',
            syncType: 'MANUAL',
            name: 'any name',
            balance: 789,
            userId: validUser.id,
            creditCardInfo: {
                brand: 'master',
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10,
            }
        }
        const addedAccount = await sut.add(account)
        
        const newAvailableCreditLimit = 23000
        await sut.updateAvaliableCreditCardLimit(addedAccount.id, newAvailableCreditLimit)

        
        expect((await sut.findById(addedAccount.id)).creditCardInfo.availableCreditLimit).toBe(newAvailableCreditLimit)
    })
})