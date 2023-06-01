import { CategoryData, TransactionData, TransactionRepository } from "@/usecases/ports";
import { AnyBulkWriteOperation, Document, ObjectId } from "mongodb";
import { MongodbCategory } from "@/external/repositories/mongodb";
import { MongoHelper } from "@/external/repositories/mongodb/helper";

export type MongodbTransaction = {
    _id?: ObjectId,
    accountId: ObjectId,
    accountType: string,
    syncType: string,
    userId: ObjectId,
    amount: number,
    description?: string,
    descriptionOriginal?: string,
    date: Date,
    invoiceDate?: Date,
    invoiceId?: ObjectId,
    type: string,
    comment?: string,
    ignored?: boolean,
    category?: MongodbCategory,
    _isDeleted?: boolean,
    providerId?: string,
}

export class MongodbTransactionRepository implements TransactionRepository {

    async add(transaction: TransactionData): Promise<TransactionData> {
        const transactionCollection = MongoHelper.getCollection('transactions')

        const transactionClone: MongodbTransaction = {
            accountId: new ObjectId(transaction.accountId),
            accountType: transaction.accountType,
            syncType: transaction.syncType,
            userId: new ObjectId(transaction.userId),
            amount: transaction.amount,
            description: transaction.description,
            descriptionOriginal: transaction.descriptionOriginal,
            date: transaction.date,
            invoiceDate: transaction.invoiceDate ?? null,
            invoiceId: transaction.invoiceId ? new ObjectId(transaction.invoiceId) : null,
            type: transaction.type,
            comment: transaction.comment,
            ignored: transaction.ignored,
            _isDeleted: transaction._isDeleted,
        }

        if(transaction.category) {
            const categoryClone: MongodbCategory = {
                _id: new ObjectId(transaction.category.id),
                name: transaction.category.name,
                group: transaction.category.group,
                iconName: transaction.category.iconName,
                primaryColor: transaction.category.primaryColor,
                ignored: transaction.category.ignored
            }

            transactionClone.category = categoryClone
        }

        const { insertedId } = await transactionCollection.insertOne(transactionClone)

        return this.findById(insertedId.toString())
    }

    async findById(id: string): Promise<TransactionData> {
        const transactionCollection = MongoHelper.getCollection('transactions')
        const transaction = await transactionCollection.findOne<MongodbTransaction>({ _id: new ObjectId(id) })
        if(transaction) {
            return this.withApplicationId(transaction)
        }
        return null
    }

    async exists(id: string): Promise<boolean> {
        const result = await this.findById(id)
        if(result != null) {
            return true
        }
        return false
    }

    async remove(id: string): Promise<TransactionData> {
        const transactionCollection = MongoHelper.getCollection('transactions')

        const updateDoc = {
            $set: {
              _isDeleted: true
            },
        };

        const result = await transactionCollection.findOneAndUpdate({ _id: new ObjectId(id) }, updateDoc, { returnDocument: 'after' });
        if(result.value) {
            return this.withApplicationId(result.value as MongodbTransaction)
        }
        return null
    }

    async updateManual(transaction: TransactionData): Promise<TransactionData> {
        const transactionCollection = MongoHelper.getCollection('transactions')

        let updateCategoryDoc = null

        if(transaction.category) {
            updateCategoryDoc = {
                _id: new ObjectId(transaction.category.id),
                name: transaction.category.name,
                group: transaction.category.group,
                iconName: transaction.category.iconName,
                primaryColor: transaction.category.primaryColor,
                ignored: !!transaction.category.ignored,
            }
        }

        const updateDoc = {
            $set: {
              amount: transaction.amount,
              type: transaction.type,
              description: transaction.description,
              descriptionOriginal: transaction.descriptionOriginal,
              date: transaction.date,
              invoiceDate: transaction.invoiceDate ?? null,
              invoiceId: transaction.invoiceId ? new ObjectId(transaction.invoiceId) : null,
              category: updateCategoryDoc,
              comment: transaction.comment,
              ignored: transaction.ignored,
            },
        };

        const result = await transactionCollection.findOneAndUpdate({ _id: new ObjectId(transaction.id) }, updateDoc, { returnDocument: 'after' });
        if(result.value) {
            return this.withApplicationId(result.value as MongodbTransaction)
        }
        return null
    }

    async updateAutomatic(transaction: TransactionData): Promise<TransactionData> {
        const transactionCollection = MongoHelper.getCollection('transactions')

        let updateCategoryDoc = null

        if(transaction.category) {
            updateCategoryDoc = {
                _id: new ObjectId(transaction.category.id),
                name: transaction.category.name,
                group: transaction.category.group,
                iconName: transaction.category.iconName,
                primaryColor: transaction.category.primaryColor,
                ignored: !!transaction.category.ignored,
            }
        }

        const updateDoc = {
            $set: {
            //   amount: transaction.amount,
            //   type: transaction.type,
              description: transaction.description,
            //   descriptionOriginal: transaction.descriptionOriginal,
            //   date: transaction.date,
            //   invoiceDate: transaction.invoiceDate ?? null,
            //   invoiceId: transaction.invoiceId ? new ObjectId(transaction.invoiceId) : null,
              category: updateCategoryDoc,
              comment: transaction.comment,
              ignored: transaction.ignored,
            },
        };

        const result = await transactionCollection.findOneAndUpdate({ _id: new ObjectId(transaction.id) }, updateDoc, { returnDocument: 'after' });
        if(result.value) {
            return this.withApplicationId(result.value as MongodbTransaction)
        }
        return null
    }

    async mergeTransactions(transactions: TransactionData[]): Promise<{ upsertedIds: string[], modifiedCount: number }> {
        const transactionCollection = MongoHelper.getCollection('transactions')

        const operations: AnyBulkWriteOperation<Document>[] = transactions.map(transaction => ({
            updateOne: {
                filter: { providerId: transaction.providerId },
                update: {
                    $set: {
                        accountId: new ObjectId(transaction.accountId),
                        accountType: transaction.accountType,
                        syncType: transaction.syncType,
                        userId: new ObjectId(transaction.userId),
                        amount: transaction.amount,
                        descriptionOriginal: transaction.descriptionOriginal,
                        date: transaction.date,
                        invoiceDate: transaction.invoiceDate ?? null,
                        invoiceId: transaction.invoiceId ? new ObjectId(transaction.invoiceId) : null,
                        type: transaction.type,
                        providerId: transaction.providerId,
                        // description: transaction.description,
                        // comment: transaction.comment,
                        // ignored: transaction.ignored,
                        // _isDeleted: transaction._isDeleted,
                    },
                },
                upsert: true,
            },
        }))

        const result = await transactionCollection.bulkWrite(operations, { ordered: false })

        return {
            upsertedIds: Object.values(result.upsertedIds).map(id => id.toString()),
            modifiedCount: result.modifiedCount,
        }
    }

    async recalculateInvoicesAmount(invoicesIds: string[]): Promise<{ invoiceId: string; amount: number; }[]> {
        const transactionCollection = MongoHelper.getCollection('transactions')
        
        const invoicesObjectIds = invoicesIds.map(i => new ObjectId(i))

        const results = await transactionCollection.aggregate([
            {
                $match: { 
                    invoiceId: { $in: invoicesObjectIds },
                    // TODO hardcoded string, use environment variable with category id
                    'category.name': { $ne: 'Pagamento de cartão' }
                }
            }, 
            {
                $group: {
                    '_id': '$invoiceId',
                    'amount': { $sum: '$amount' }
                }
            },
            {
                $addFields: {
                  "invoiceId": { $toString: "$_id" },
                }
            },
        ]).toArray() 

        return invoicesObjectIds.map(invoiceId => ({
            invoiceId: invoiceId.toString(),
            amount: results.find(e => e.invoiceId == invoiceId.toString())?.amount ?? 0,
        }))
    }


    private withApplicationId (dbTransaction: MongodbTransaction): TransactionData {
        let category: CategoryData = null

        if(dbTransaction.category) {
            category = {
                id: dbTransaction.category._id.toString(),
                name: dbTransaction.category.name,
                group: dbTransaction.category.group,
                iconName: dbTransaction.category.iconName,
                primaryColor: dbTransaction.category.primaryColor,
                ignored: dbTransaction.category.ignored
            }
        }

        return {
            id: dbTransaction._id.toString(),
            accountId: dbTransaction.accountId.toString(),
            accountType: dbTransaction.accountType,
            syncType: dbTransaction.syncType,
            userId: dbTransaction.userId.toString(),
            amount: dbTransaction.amount,
            description: dbTransaction.description,
            descriptionOriginal: dbTransaction.descriptionOriginal,
            date: dbTransaction.date,
            invoiceDate: dbTransaction.invoiceDate,
            invoiceId: dbTransaction.invoiceId ? dbTransaction.invoiceId.toString() : null,
            type: dbTransaction.type,
            comment: dbTransaction.comment,
            ignored: dbTransaction.ignored,
            _isDeleted: dbTransaction._isDeleted,
            category,
            providerId: dbTransaction.providerId,
        }
    }
    
}