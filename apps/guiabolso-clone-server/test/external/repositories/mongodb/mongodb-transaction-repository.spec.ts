import { MongodbTransactionRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { CategoryData, TransactionData } from "@/usecases/ports"
import { ObjectId } from "mongodb"

describe('Mongodb Transaction repository', () => { 
    const validUserId = new ObjectId()
    const validWalletAccountId = new ObjectId()
    const validBankAccountId = new ObjectId()
    const validCreditCardAccountId = new ObjectId()

    let validCategory0: CategoryData = {
        id: new ObjectId().toString(),
        name: "category 0",
        group: "VALIDGROUP",
        iconName: "ICON 0",
        primaryColor: "COLOR 0",
        ignored: false
    }

    let validCategory1: CategoryData = {
        id: new ObjectId().toString(),
        name: "category 1",
        group: "VALIDGROUP",
        iconName: "ICON 1",
        primaryColor: "COLOR 1",
        ignored: false
    }

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('transactions')
        await MongoHelper.disconnect()
    })

    beforeEach(async () => {
        await MongoHelper.clearCollection('transactions')
    })

    describe('add transaction', () => {
        test('when a wallet transaction is added, it should exists', async () => {
            const sut = new MongodbTransactionRepository()
            const transactionData: TransactionData = {
                accountId: validWalletAccountId.toString(),
                accountType: 'WALLET',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: 2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-05-18'),
                type: 'INCOME',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
                _isDeleted: false,
            }
    
            const addedTransaction =  await sut.add(transactionData)
            expect(addedTransaction.id).toBeDefined()
            expect(addedTransaction.userId).toBe(validUserId.toString())
            expect(addedTransaction.accountId).toBe(validWalletAccountId.toString())
            expect(addedTransaction.accountType).toBe('WALLET')
            expect(addedTransaction.category.id).toBe(validCategory0.id)
            expect(addedTransaction.date).toEqual(transactionData.date)
            const exists = await sut.exists(addedTransaction.id)
            expect(exists).toBeTruthy()
        })

        test('when a bank transaction is added, it should exists', async () => {
            const sut = new MongodbTransactionRepository()
            const transactionData: TransactionData = {
                accountId: validBankAccountId.toString(),
                accountType: 'BANK',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: 2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-05-18'),
                type: 'INCOME',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
                _isDeleted: false,
            }
    
            const addedTransaction =  await sut.add(transactionData)
            expect(addedTransaction.id).toBeDefined()
            expect(addedTransaction.userId).toBe(validUserId.toString())
            expect(addedTransaction.accountId).toBe(validBankAccountId.toString())
            expect(addedTransaction.accountType).toBe('BANK')
            expect(addedTransaction.category.id).toBe(validCategory0.id)
            expect(addedTransaction.date).toEqual(transactionData.date)
            const exists = await sut.exists(addedTransaction.id)
            expect(exists).toBeTruthy()
        })

        test('when a credit card transaction is added, it should exists', async () => {
            const sut = new MongodbTransactionRepository()
            const transactionData: TransactionData = {
                accountId: validCreditCardAccountId.toString(),
                accountType: 'CREDIT_CARD',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: -2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-06-10'),
                invoiceDate: new Date('2023-05-18'),
                invoiceId: new ObjectId().toString(),
                type: 'EXPENSE',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
                _isDeleted: false,
            }
    
            const addedTransaction =  await sut.add(transactionData)
            expect(addedTransaction.id).toBeDefined()
            expect(addedTransaction.userId).toBe(validUserId.toString())
            expect(addedTransaction.accountId).toBe(validCreditCardAccountId.toString())
            expect(addedTransaction.accountType).toBe('CREDIT_CARD')
            expect(addedTransaction.category.id).toBe(validCategory0.id)
            expect(addedTransaction.date).toEqual(transactionData.date)
            expect(addedTransaction.invoiceDate).toEqual(transactionData.invoiceDate)
            expect(addedTransaction.invoiceId).toBe(transactionData.invoiceId)
            const exists = await sut.exists(addedTransaction.id)
            expect(exists).toBeTruthy()
        })
    })

    describe('find by id', () => {
        test('when a transaction is not find by id, should return null', async () => {
            const notFoundId = '62f95f4a93d61d8fff971668'
            const sut = new MongodbTransactionRepository()
            const result = await sut.findById(notFoundId)
            expect(result).toBeNull()
        })
    
        test('when a wallet transaction is find by id, should return the transaction', async () => {
            const sut = new MongodbTransactionRepository()
            const transactionData: TransactionData = {
                accountId: validWalletAccountId.toString(),
                accountType: 'WALLET',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: 2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-05-18'),
                type: 'INCOME',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
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

        test('when a bank transaction is find by id, should return the transaction', async () => {
            const sut = new MongodbTransactionRepository()
            const transactionData: TransactionData = {
                accountId: validBankAccountId.toString(),
                accountType: 'BANK',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: 2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-05-18'),
                type: 'INCOME',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
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

        test('when a credit card transaction is find by id, should return the transaction', async () => {
            const sut = new MongodbTransactionRepository()
            const transactionData: TransactionData = {
                accountId: validCreditCardAccountId.toString(),
                accountType: 'CREDIT_CARD',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: -2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-06-10'),
                invoiceDate: new Date('2023-05-18'),
                invoiceId: new ObjectId().toString(),
                type: 'EXPENSE',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
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
            expect(result.invoiceDate).toEqual(transactionData.invoiceDate)
            expect(result.invoiceId).toEqual(transactionData.invoiceId)
            expect(result.type).toBe(transactionData.type)
            expect(result.comment).toBe(transactionData.comment)
            expect(result.ignored).toBe(transactionData.ignored)
            expect(result.category).toEqual(transactionData.category)
            expect(result._isDeleted).toBe(transactionData._isDeleted)
    
        })
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
            accountId: validWalletAccountId.toString(),
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUserId.toString(),
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

    
    test('should return null if a transaction to update is not found', async () => {
        const sut = new MongodbTransactionRepository()

        const notFoundId = '62f95f4a93d61d8fff971668'
        const transactionData: TransactionData = {
            id: notFoundId,
            accountId: validWalletAccountId.toString(),
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUserId.toString(),
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
        const updatedTransaction = await sut.update(transactionData)
        expect(updatedTransaction).toBeNull()

    })

        
    test('should update a valid transaction', async () => {
        const sut = new MongodbTransactionRepository()

        const transactionData: TransactionData = {
            accountId: validWalletAccountId.toString(),
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUserId.toString(),
            amount: 2345,
            description: 'valid description',
            descriptionOriginal: '',
            date: new Date('2023-05-18'),
            type: 'INCOME',
            comment: 'valid comment',
            ignored: false,
            category: validCategory0,
            _isDeleted: false,
        }

        const insertedTransaction = await sut.add(transactionData)

        const updateTransactionData: TransactionData = {
            id: insertedTransaction.id,
            accountId: validWalletAccountId.toString(),
            accountType: 'WALLET',
            syncType: 'MANUAL',
            userId: validUserId.toString(),
            amount: -5000,
            description: 'updated description',
            descriptionOriginal: 'updated original',
            date: new Date('2023-01-15'),
            type: 'EXPENSE',
            comment: 'updated comment',
            ignored: true,
            category: validCategory1,
            _isDeleted: false,
        }

        const updatedTransaction = await sut.update(updateTransactionData)

        const transaction = await sut.findById(updatedTransaction.id)
        expect(transaction.amount).toBe(updateTransactionData.amount)
        expect(transaction.type).toBe(updateTransactionData.type)
        expect(transaction.description).toBe(updateTransactionData.description)
        expect(transaction.descriptionOriginal).toBe(updateTransactionData.descriptionOriginal)
        expect(transaction.date).toEqual(updateTransactionData.date)
        expect(transaction.comment).toBe(updateTransactionData.comment)
        expect(transaction.ignored).toBe(updateTransactionData.ignored)
        expect(transaction.category).toEqual(updateTransactionData.category)
    })

    test.todo('update wallet, bank, credit card transaction')
})