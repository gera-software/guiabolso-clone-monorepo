import { AccountData, AccountRepository } from "@/usecases/ports"
import { ObjectId } from "mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"

export type MongodbAccount = {
    name: string,
    balance: number,
    imageUrl?: string,
    userId: ObjectId,
    _id: ObjectId
}


export class MongodbAccountRepository implements AccountRepository {

    async add(account: AccountData): Promise<AccountData> {
        const accountCollection = MongoHelper.getCollection('accounts')

        const acountClone: AccountData = {
            name: account.name,
            balance: account.balance,
            imageUrl: account.imageUrl,
            userId: account.userId
        }
    
        const { insertedId } = await accountCollection.insertOne(acountClone)
    
        return this.findById(insertedId.toString())
    }

    async findById(id: string): Promise<AccountData> {
        const accountCollection = MongoHelper.getCollection('accounts')
        const account = await accountCollection.findOne<MongodbAccount>({ _id: new ObjectId(id) })
        if(account) {
            return this.withApplicationId(account)
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

    private withApplicationId (dbAccount: MongodbAccount): AccountData {
        return {
            name: dbAccount.name,
            balance: dbAccount.balance,
            imageUrl: dbAccount.imageUrl,
            userId: dbAccount.userId.toString(),
            id: dbAccount._id.toString(),
        }
    }

}