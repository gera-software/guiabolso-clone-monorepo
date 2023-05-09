import { MongodbAccountRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { AccountData, BankAccountData, CreditCardAccountData, CreditCardInfoData, InstitutionData, WalletAccountData } from "@/usecases/ports"
import { ObjectId } from "mongodb"

describe('Mongodb Account repository', () => {

    const validUserId = new ObjectId()

    let validInstitution: InstitutionData = {
        id: new ObjectId().toString(),
        name: 'institution 0', 
        type: 'PERSONAL_BANK', 
        imageUrl: 'url 0', 
        primaryColor: 'color 0',
        providerConnectorId: 'connector 0'
    }

    const validCreditCardInfoData: CreditCardInfoData = {
        brand: "master card",
        creditLimit: 100000,
        availableCreditLimit: 50000,
        closeDay: 3,
        dueDay: 10
    }

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
    })
    
    afterAll(async () => {
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.disconnect()
    })
    
    beforeEach(async () => {
        await MongoHelper.clearCollection('accounts')
    })

    describe('add account', () => {        
        test('when a manual wallet account is added, it should exist', async () => {
            const sut = new MongodbAccountRepository()
            const account: WalletAccountData = {
                type: 'WALLET',
                syncType: 'MANUAL',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString()
            }
            const addedAccount = await sut.add(account)
            expect(addedAccount.userId).toBe(validUserId.toString())
            const exists = await sut.exists(addedAccount.id)
            expect(exists).toBeTruthy()
        })
    
        test('when a manual bank account is added, it should exist', async () => {
            const sut = new MongodbAccountRepository()
            const account: BankAccountData = {
                type: 'BANK',
                syncType: 'MANUAL',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString(),
                institution: validInstitution
            }
            const addedAccount = await sut.add(account)
            expect(addedAccount.userId).toBe(validUserId.toString())
            expect(addedAccount.institution.id).toBe(validInstitution.id)
            const exists = await sut.exists(addedAccount.id)
            expect(exists).toBeTruthy()
        })
    
        test('when a manual credit card account is added, it should exist', async () => {
            const sut = new MongodbAccountRepository()
            const account: CreditCardAccountData = {
                type: 'CREDIT_CARD',
                syncType: 'MANUAL',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString(),
                institution: validInstitution,
                creditCardInfo: validCreditCardInfoData
            }
            const addedAccount = await sut.add(account)
            expect(addedAccount.userId).toBe(validUserId.toString())
            expect(addedAccount.institution.id).toBe(validInstitution.id)
            expect(addedAccount.creditCardInfo).toEqual(validCreditCardInfoData)
            const exists = await sut.exists(addedAccount.id)
            expect(exists).toBeTruthy()
        })

        test('when a automatic bank account is added, it should exist', async () => {
            const sut = new MongodbAccountRepository()
            const account: BankAccountData = {
                type: 'BANK',
                syncType: 'AUTOMATIC',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString(),
                institution: validInstitution,
                providerAccountId: 'valid-provider-account-id',
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                }
            }
            const addedAccount = await sut.add(account)
            expect(addedAccount.userId).toBe(validUserId.toString())
            expect(addedAccount.institution.id).toBe(validInstitution.id)
            expect(addedAccount.providerAccountId).toBe(account.providerAccountId)
            expect(addedAccount.synchronization).toEqual(account.synchronization)

            const exists = await sut.findById(addedAccount.id)
            expect(exists.providerAccountId).toBe(addedAccount.providerAccountId)
            expect(exists.synchronization).toEqual(addedAccount.synchronization)
        })

        test('when a automatic credit card account is added, it should exist', async () => {
            const sut = new MongodbAccountRepository()
            const account: CreditCardAccountData = {
                type: 'CREDIT_CARD',
                syncType: 'AUTOMATIC',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString(),
                institution: validInstitution,
                creditCardInfo: validCreditCardInfoData,
                providerAccountId: 'valid-provider-account-id',
                synchronization: {
                    providerItemId: 'valid-provider-item-id',
                    createdAt: new Date(),
                }
            }
            const addedAccount = await sut.add(account)
            expect(addedAccount.userId).toBe(validUserId.toString())
            expect(addedAccount.institution.id).toBe(validInstitution.id)
            expect(addedAccount.creditCardInfo).toEqual(validCreditCardInfoData)
            expect(addedAccount.providerAccountId).toBe(account.providerAccountId)
            expect(addedAccount.synchronization).toEqual(account.synchronization)

            const exists = await sut.findById(addedAccount.id)
            expect(exists.creditCardInfo).toEqual(validCreditCardInfoData)
            expect(exists.providerAccountId).toBe(addedAccount.providerAccountId)
            expect(exists.synchronization).toEqual(addedAccount.synchronization)
        })

    })

    describe('find by id', () => {
        test('when an account is not find by id, should return null', async () => {
            const notFoundId = '62f95f4a93d61d8fff971668'
            const sut = new MongodbAccountRepository()
            const result = await sut.findById(notFoundId)
            expect(result).toBeNull()
        })
    
        test('when a wallet account is find by id, should return the account', async () => {
            const sut = new MongodbAccountRepository()
            const account: WalletAccountData = {
                type: 'WALLET',
                syncType: 'MANUAL',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString()
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
            const account: BankAccountData = {
                type: 'BANK',
                syncType: 'MANUAL',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString(),
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
            const account: CreditCardAccountData = {
                type: 'CREDIT_CARD',
                syncType: 'MANUAL',
                name: 'any name',
                balance: 789,
                userId: validUserId.toString(),
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
    })

    test('should update account balance', async () => {
        const sut = new MongodbAccountRepository()
        const account: AccountData = {
            type: 'WALLET',
            syncType: 'MANUAL',
            name: 'any name',
            balance: 789,
            userId: validUserId.toString()
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
            userId: validUserId.toString(),
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