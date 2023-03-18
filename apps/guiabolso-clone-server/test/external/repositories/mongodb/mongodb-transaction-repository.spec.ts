import { MongodbAccountRepository, MongodbCategory, MongodbCategoryRepository, MongodbTransactionRepository, MongodbUserRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { CategoryData, TransactionData, UserData, WalletAccountData } from "@/usecases/ports"

describe('Mongodb Transaction repository', () => { 
    const userRepo = new MongodbUserRepository()
    let validUser: UserData

    const accountRepo = new MongodbAccountRepository()
    let validWalletAccount: WalletAccountData

    const categoryRepo = new MongodbCategoryRepository()
    let validCategory0: CategoryData
    let validCategory1: CategoryData

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        const user = {
            name: 'any_name',
            email: 'any@mail.com',
            password: '123',
        }
        validUser = await userRepo.add(user)

        const walletAccount: WalletAccountData = {
            type: "WALLET",
            syncType: "MANUAL",
            name: "valid wallet account",
            balance: 0,
            userId: validUser.id,
        }
        validWalletAccount = await accountRepo.add(walletAccount)

        const category0: MongodbCategory = {
            _id: null,
            name: "category 0",
            group: "VALIDGROUP",
            iconName: "ICON 0",
            primaryColor: "COLOR 0",
            ignored: false
        }
        const category1: MongodbCategory = {
            _id: null,
            name: "category 1",
            group: "VALIDGROUP",
            iconName: "ICON 1",
            primaryColor: "COLOR 1",
            ignored: false
        }

        const categoryCollection = MongoHelper.getCollection('categories')
        await categoryCollection.insertMany([ category0, category1 ])

        const [ cat0, cat1 ]= await categoryRepo.fetchAll()
        validCategory0 = cat0
        validCategory1 = cat1
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.disconnect()
    })

    beforeEach(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.clearCollection('categories')
        await MongoHelper.clearCollection('transactions')
    })

    test('when transaction is added, it should exists', async () => {
        const sut = new MongodbTransactionRepository()
        const transactionData: TransactionData = {
            accountId: validWalletAccount.id,
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUser.id,
            amount: 2345,
            description: 'valid description',
            descriptionOriginal: '',
            date: new Date('2023-05-18'),
            type: 'INCOME',
            comment: 'valid comment',
            ignored: false,
            category: {
                id: validCategory0.id,
                name: "category 0",
                group: "group 0",
                iconName: "icon 0",
                primaryColor: "color 0",
                ignored: true,
            },
            _isDeleted: false,
        }

        const addedTransaction =  await sut.add(transactionData)
        expect(addedTransaction.id).toBeDefined()
        const exists = await sut.exists(addedTransaction.id)
        expect(exists).toBeTruthy()
    })

    test('when a transaction is not find by id, should return null', async () => {
        const notFoundId = '62f95f4a93d61d8fff971668'
        const sut = new MongodbTransactionRepository()
        const result = await sut.findById(notFoundId)
        expect(result).toBeNull()
    })

    test('when a transaction is find by id, should return the transaction', async () => {
        const sut = new MongodbTransactionRepository()
        const transactionData: TransactionData = {
            accountId: validWalletAccount.id,
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUser.id,
            amount: 2345,
            description: 'valid description',
            descriptionOriginal: '',
            date: new Date('2023-05-18'),
            type: 'INCOME',
            comment: 'valid comment',
            ignored: false,
            category: {
                id: validCategory0.id,
                name: "category 0",
                group: "group 0",
                iconName: "icon 0",
                primaryColor: "color 0",
                ignored: true,
            },
            _isDeleted: false,
        }

        const addedTransaction =  await sut.add(transactionData)

        const result: TransactionData = await sut.findById(addedTransaction.id) as TransactionData
        expect(result).not.toBeNull()
        expect(result.id).toBe(addedTransaction.id)
        expect(result.accountId).toBe(transactionData.accountId)
        expect(result.accountType).toBe(transactionData.accountType)
        expect(result.syncType).toBe(transactionData.syncType)
        expect(result.userId).toBe(transactionData.userId)
        expect(result.amount).toBe(transactionData.amount)
        expect(result.description).toBe(transactionData.description)
        expect(result.descriptionOriginal).toBe(transactionData.descriptionOriginal)
        expect(result.date).toEqual(transactionData.date)
        expect(result.type).toBe(transactionData.type)
        expect(result.comment).toBe(transactionData.comment)
        expect(result.ignored).toBe(transactionData.ignored)
        expect(result.category).toEqual(transactionData.category)
        expect(result._isDeleted).toBe(transactionData._isDeleted)

    })

    test('should return null if a transaction to remove is not found', async () => {
        const sut = new MongodbTransactionRepository()

        const notFoundId = '62f95f4a93d61d8fff971668'
        const removedTransaction = await sut.remove(notFoundId)
        expect(removedTransaction).toBeNull()

    })

    test('when a transaction is removed, should be a logic exclusion', async () => {
        const sut = new MongodbTransactionRepository()
        const transactionData: TransactionData = {
            accountId: validWalletAccount.id,
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUser.id,
            amount: 2345,
            description: 'valid description',
            descriptionOriginal: '',
            date: new Date('2023-05-18'),
            type: 'INCOME',
            comment: 'valid comment',
            ignored: false,
            category: {
                id: validCategory0.id,
                name: "category 0",
                group: "group 0",
                iconName: "icon 0",
                primaryColor: "color 0",
                ignored: true,
            },
            _isDeleted: false,
        }

        const addedTransaction =  await sut.add(transactionData)

        const removedTransaction = await sut.remove(addedTransaction.id)

        const transaction = await sut.findById(removedTransaction.id)
        expect(transaction._isDeleted).toBeTruthy()
    })
})