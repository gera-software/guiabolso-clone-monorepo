import { CategoryData, TransactionData, TransactionRepository } from "@/usecases/ports";
import { ObjectId } from "mongodb";
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
    type: string,
    comment?: string,
    ignored?: boolean,
    category?: MongodbCategory,
    _isDeleted?: boolean,
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

    async update(transaction: TransactionData): Promise<TransactionData> {
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
            type: dbTransaction.type,
            comment: dbTransaction.comment,
            ignored: dbTransaction.ignored,
            _isDeleted: dbTransaction._isDeleted,
            category,
        }
    }
    
}