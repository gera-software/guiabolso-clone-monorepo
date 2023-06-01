import request from "supertest"
import app from "@/main/config/app"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeAccountRepository, makeInstitutionRepository, makeUserRepository } from "@/main/factories"
import { AccountData, BankAccountData, CreditCardAccountData, InstitutionData, TransactionRequest, UserData } from "@/usecases/ports"
import { MongodbInstitution } from "@/external/repositories/mongodb"
import { PluggyDataProvider } from "@/external/financial-data-provider"
import { right } from "@/shared"
import { Collection, Document } from "mongodb"

jest.mock('@/external/financial-data-provider')
const mockedDataProvider = jest.mocked(PluggyDataProvider)

describe('Sync automatic account route', () => {
    const userRepo = makeUserRepository()
    const accountRepo = makeAccountRepository()
    const institutionRepo = makeInstitutionRepository()
    let transactionCollection: Collection<Document>

    let validUser: UserData
    let validInstitution: InstitutionData

    let bankAccount: BankAccountData
    let creditAccount: CreditCardAccountData

    const institutionsArray: MongodbInstitution[] = [{
        _id: null,
        name: 'institution 0', 
        type: 'PERSONAL_BANK', 
        imageUrl: 'url 0', 
        primaryColor: 'color 0',
        providerConnectorId: 'connector 0'
    }]

    const validItemId = "a5d1ca6c-24c0-41c7-8b44-9272cc868663"

    const pluggyBankAccount: AccountData = {
        "balance": 120950, 
        "creditCardInfo": null, 
        "id": null, 
        "imageUrl": 'image url', 
        "institution": {
            "id": null, 
            "imageUrl": 'image url', 
            "name": 'institution 1', 
            "primaryColor": 'color', 
            "providerConnectorId": '1', 
            "type": "PERSONAL_BANK"
        }, 
        "name": 'bank account', 
        "providerAccountId": 'valid-provider-bank-account-id', 
        "syncType": "AUTOMATIC", 
        "synchronization": {
            "createdAt": new Date("2021-12-28T21:48:02.863Z"), 
            "providerItemId": validItemId,
            "syncStatus": 'UPDATED',
            "lastSyncAt": new Date("2021-12-28T21:48:02.863Z")
        }, 
        "type": "BANK", 
        "userId": null,
    }
    const pluggyCreditAccount: AccountData = {
        "balance": -120950, 
        "creditCardInfo": {
            "availableCreditLimit": 200000, 
            "creditLimit": 300000, 
            "brand": "MASTERCARD", 
            "closeDay": 3, 
            "dueDay": 10
        }, 
        "id": null, 
        "imageUrl": "image url", 
        "institution": {
            "id": null, 
            "imageUrl": 'image url', 
            "name": 'institution 1', 
            "primaryColor": 'color', 
            "providerConnectorId": '1', 
            "type": "PERSONAL_BANK"
        }, 
        "name": "credit card account", 
        "providerAccountId": 'valid-provider-credit-account-id', 
        "syncType": "AUTOMATIC", 
        "synchronization": {
            "createdAt": new Date("2021-12-28T21:48:02.863Z"), 
            "providerItemId": validItemId,
            "syncStatus": 'UPDATED',
            "lastSyncAt": new Date("2021-12-28T21:48:02.863Z")
        }, 
        "type": "CREDIT_CARD", 
        "userId": null,
    }

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('credit_card_invoices')

        const institutionCollection = MongoHelper.getCollection('institutions')
        await institutionCollection.insertMany(institutionsArray)
        validInstitution = (await institutionRepo.fetchByType('PERSONAL_BANK'))[0]

        transactionCollection = MongoHelper.getCollection('transactions')

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })

        bankAccount = await accountRepo.add({
            type: 'BANK',
            syncType: 'AUTOMATIC',
            name: 'any name',
            balance: 789,
            userId: validUser.id.toString(),
            institution: validInstitution,
            providerAccountId: 'valid-provider-bank-account-id',
            synchronization: {
                providerItemId: 'valid-provider-item-id',
                createdAt: new Date(),
                syncStatus: 'UPDATED',
                lastSyncAt: new Date("2021-12-28T21:48:02.863Z"),
                lastMergeAt: new Date("2021-12-28T21:48:02.863Z"),
            }
        })

        creditAccount = await accountRepo.add({
            type: 'CREDIT_CARD',
            syncType: 'AUTOMATIC',
            name: 'any name',
            balance: 789,
            userId: validUser.id.toString(),
            institution: validInstitution,
            creditCardInfo: {
                brand: "master card",
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10
            },
            providerAccountId: 'valid-provider-credit-account-id',
            synchronization: {
                providerItemId: 'valid-provider-item-id',
                createdAt: new Date(),
                syncStatus: 'UPDATED',
                lastSyncAt: new Date("2021-12-28T21:48:02.863Z"),
                lastMergeAt: new Date("2021-12-28T21:48:02.863Z")
            }
        })


    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.clearCollection('credit_card_invoices')
        await MongoHelper.disconnect()
    })

    describe('bank account', () => {
        test('should sync transactions of a bank account', async () => {
            mockedDataProvider.prototype.getAccountsByItemId.mockResolvedValueOnce(right([pluggyBankAccount, pluggyCreditAccount]))
           
            const pluggyTransactions: TransactionRequest[] = [
                {
                    id: null,
                    accountId: bankAccount.id,
                    amount: -10000,
                    descriptionOriginal: 'compra oline',
                    date: new Date('2023-05-27'),
                    providerId: 'provider-transaction-id-0',
                },
                {
                    id: null,
                    accountId: bankAccount.id,
                    amount: 45089,
                    descriptionOriginal: 'deposito recebido',
                    date: new Date('2023-05-24'),
                    providerId: 'provider-transaction-id-2',
                }
            ]
            mockedDataProvider.prototype.getTransactionsByProviderAccountId.mockResolvedValueOnce(right(pluggyTransactions))


            await request(app)
                .post('/api/sync-accounts')
                .send({
                    accountId: bankAccount.id,
                })
                .expect(200)
                .then(async (res) => {
                    expect(res.body.balance).toBe(pluggyBankAccount.balance)
                    expect(res.body.synchronization.lastSyncAt).not.toBeNull()
                    expect(res.body.synchronization.lastMergeAt).not.toBeNull()
                    expect(res.body.synchronization.mergeStatus).toBe('MERGED')
                    
                    const insertedTransactions = await transactionCollection.find({}).toArray()
                    expect(insertedTransactions).toHaveLength(2)
                })
        })
    })
    
    describe('credit card account', () => {
        test('should sync transactions of a credit card account', async () => {
            mockedDataProvider.prototype.getAccountsByItemId.mockResolvedValueOnce(right([pluggyBankAccount, pluggyCreditAccount]))
    
            const pluggyTransactions: TransactionRequest[] = [
                {
                    id: null,
                    accountId: creditAccount.id,
                    amount: -10000,
                    descriptionOriginal: 'compra oline',
                    date: new Date('2023-05-27'),
                    providerId: 'provider-transaction-id-0',
                },
                {
                    id: null,
                    accountId: creditAccount.id,
                    amount: 45089,
                    descriptionOriginal: 'pagamento recebido',
                    date: new Date('2023-05-24'),
                    providerId: 'provider-transaction-id-2',
                }
            ]
            mockedDataProvider.prototype.getTransactionsByProviderAccountId.mockResolvedValueOnce(right(pluggyTransactions))

            await request(app)
                .post('/api/sync-accounts')
                .send({
                    accountId: creditAccount.id,
                })
                .expect(200)
                .then(async (res) => {
                    expect(res.body.balance).toBe(pluggyCreditAccount.balance)
                    expect(res.body.creditCardInfo.availableCreditLimit).toBe(pluggyCreditAccount.creditCardInfo.availableCreditLimit)
                    expect(res.body.creditCardInfo.creditLimit).toBe(pluggyCreditAccount.creditCardInfo.creditLimit)
                    expect(res.body.synchronization.lastSyncAt).not.toBeNull()
                    expect(res.body.synchronization.lastMergeAt).not.toBeNull()
                    expect(res.body.synchronization.mergeStatus).toBe('MERGED')
                    
                    const insertedTransactions = await transactionCollection.find({}).toArray()
                    expect(insertedTransactions).toHaveLength(2)
                })
        })
    })
})