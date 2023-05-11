import { MongodbTransaction, MongodbTransactionRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { CategoryData, TransactionData } from "@/usecases/ports"
import { ObjectId } from "mongodb"

describe('Mongodb Transaction repository', () => { 
    const validUserId = new ObjectId()
    const validWalletAccountId = new ObjectId()
    const validBankAccountId = new ObjectId()
    const validCreditCardAccountId = new ObjectId()
    const validCategory0Id = new ObjectId()
    const validCategory1Id = new ObjectId()

    let validCategory0: CategoryData = {
        id: validCategory0Id.toString(),
        name: "category 0",
        group: "VALIDGROUP",
        iconName: "ICON 0",
        primaryColor: "COLOR 0",
        ignored: false
    }

    let validCategory1: CategoryData = {
        id: validCategory1Id.toString(),
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


    describe('remove', () => {
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
    })

    describe('update', () => {
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

        test('should update a valid wallet transaction', async () => {
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

        test('should update a valid bank transaction', async () => {
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
    
            const insertedTransaction = await sut.add(transactionData)
    
            const updateTransactionData: TransactionData = {
                id: insertedTransaction.id,
                accountId: validBankAccountId.toString(),
                accountType: 'BANK',
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

        test('should update a valid credit card transaction', async () => {
            const sut = new MongodbTransactionRepository()
    
            const transactionData: TransactionData = {
                accountId: validCreditCardAccountId.toString(),
                accountType: 'CREDIT_CARD',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: 2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-06-10'),
                invoiceDate: new Date('2023-05-18'),
                invoiceId: new ObjectId().toString(),
                type: 'INCOME',
                comment: 'valid comment',
                ignored: false,
                category: validCategory0,
                _isDeleted: false,
            }
    
            const insertedTransaction = await sut.add(transactionData)
    
            const updateTransactionData: TransactionData = {
                id: insertedTransaction.id,
                accountId: validCreditCardAccountId.toString(),
                accountType: 'CREDIT_CARD',
                syncType: 'MANUAL',
                userId: validUserId.toString(),
                amount: -5000,
                description: 'updated description',
                descriptionOriginal: 'updated original',
                date: new Date('2023-05-10'),
                invoiceDate: new Date('2023-05-01'),
                invoiceId: new ObjectId().toString(),
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
            expect(transaction.invoiceDate).toEqual(updateTransactionData.invoiceDate)
            expect(transaction.invoiceId).toEqual(updateTransactionData.invoiceId)
            expect(transaction.comment).toBe(updateTransactionData.comment)
            expect(transaction.ignored).toBe(updateTransactionData.ignored)
            expect(transaction.category).toEqual(updateTransactionData.category)
        })
    })
    
    describe('merge automatic bank transactions', () => {
        test('se uma transação ainda não existir, deve inserir a transação', async () => {
            const sut = new MongodbTransactionRepository()

            const transactionData: TransactionData = {
                accountId: validBankAccountId.toString(),
                accountType: 'BANK',
                syncType: 'AUTOMATIC',
                userId: validUserId.toString(),
                amount: 2345,
                descriptionOriginal: 'valid description',
                date: new Date('2023-05-18'),
                type: 'INCOME',
                providerId: 'valid-provider-transaction-id'
            }

            const result = await sut.mergeTransactions([transactionData])

            expect(result.upsertedIds[0]).toBeDefined()
            const transaction = await sut.findById(result.upsertedIds[0].toString())
            expect(transaction).toEqual({
                id: result.upsertedIds[0].toString(),
                accountId: validBankAccountId.toString(),
                accountType: 'BANK',
                syncType: 'AUTOMATIC',
                userId: validUserId.toString(),
                amount: 2345,
                description: undefined,
                descriptionOriginal: 'valid description',
                date: new Date('2023-05-18'),
                type: 'INCOME',
                comment: undefined,
                ignored: undefined,
                category: null,
                _isDeleted: undefined,
                invoiceDate: undefined,
                invoiceId: null,
                providerId: 'valid-provider-transaction-id',
            })
        })

        test('se uma transação já existir, deve fazer um merge (atualizar sem sobrescrever campos já personalizados pelo usuário)', async () => {
            const transactionCollection = MongoHelper.getCollection('transactions')
            
            const transactionBefore: MongodbTransaction = {
                accountId: validBankAccountId,
                accountType: 'BANK',
                syncType: 'AUTOMATIC',
                userId: validUserId,
                amount: 2345,
                description: 'valid description',
                descriptionOriginal: '',
                date: new Date('2023-05-18'),
                invoiceDate: null,
                invoiceId: null,
                type: 'INCOME',
                category: {
                    _id: validCategory0Id,
                    name: validCategory0.name,
                    group: validCategory0.group,
                    iconName: validCategory0.iconName,
                    primaryColor: validCategory0.primaryColor,
                    ignored: validCategory0.ignored
                },
                comment: 'valid comment',
                ignored: true,
                _isDeleted: true,
                providerId: 'valid-provider-transaction-id',
            }

            const { insertedId } = await transactionCollection.insertOne(transactionBefore)


            const sut = new MongodbTransactionRepository()


            const transactionData: TransactionData = {
                accountId: validBankAccountId.toString(),
                accountType: 'BANK',
                syncType: 'AUTOMATIC',
                userId: validUserId.toString(),
                amount: -5678,
                descriptionOriginal: 'valid original description',
                date: new Date('2023-03-06'),
                type: 'EXPENSE',
                providerId: 'valid-provider-transaction-id'
            }

            const result = await sut.mergeTransactions([transactionData])

            
            expect(result.modifiedCount).toEqual(1)
            const transactionModified = await sut.findById(insertedId.toString())
            expect(transactionModified).toEqual({
                id: insertedId.toString(),
                accountId: transactionData.accountId,
                accountType: transactionData.accountType,
                syncType: transactionData.syncType,
                userId: transactionData.userId,
                amount: transactionData.amount,
                descriptionOriginal: transactionData.descriptionOriginal,
                date: transactionData.date,
                type: transactionData.type,
                description: transactionBefore.description,
                comment: transactionBefore.comment,
                ignored: transactionBefore.ignored,
                category: {
                    id: transactionBefore.category._id.toString(),
                    name: transactionBefore.category.name,
                    group: transactionBefore.category.group,
                    iconName: transactionBefore.category.iconName,
                    primaryColor: transactionBefore.category.primaryColor,
                    ignored: transactionBefore.category.ignored
                },
                _isDeleted: transactionBefore._isDeleted,
                invoiceDate: transactionBefore.invoiceDate,
                invoiceId: transactionBefore.invoiceId,
                providerId: transactionBefore.providerId,
            })
        })

        test.todo('deve executar em paralelo, continuando as operações, mesmo que alguma de erro')
    })
})