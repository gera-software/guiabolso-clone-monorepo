import { AccountData, AccountRepository, InstitutionData } from "@/usecases/ports"
import { ObjectId } from "mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { MongodbInstitution } from "@/external/repositories/mongodb"

export type MongodbAccount = {
    type: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: ObjectId,
    _id?: ObjectId,
    institution?: MongodbInstitution
}


export class MongodbAccountRepository implements AccountRepository {

    async add(account: AccountData): Promise<AccountData> {
        const accountCollection = MongoHelper.getCollection('accounts')

        const accountClone: MongodbAccount = {
            type: account.type,
            name: account.name,
            balance: account.balance,
            imageUrl: account.imageUrl,
            userId: new ObjectId(account.userId),
            institution: null as any,
        }

        if(account.institution) {
            const institutionClone: MongodbInstitution = {
                _id: new ObjectId(account.institution.id), 
                name: account.institution.name, 
                type: account.institution.type, 
                imageUrl: account.institution.imageUrl, 
                primaryColor: account.institution.primaryColor, 
                providerConnectorId: account.institution.providerConnectorId,
            }

            accountClone.institution = institutionClone
        }
    
        const { insertedId } = await accountCollection.insertOne(accountClone)
    
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
        let institution: InstitutionData = null

        if(dbAccount.institution) {
            institution = {
                id: dbAccount.institution._id.toString(),
                name: dbAccount.institution.name,
                type: dbAccount.institution.type,
                imageUrl: dbAccount.institution.imageUrl,
                primaryColor: dbAccount.institution.primaryColor,
                providerConnectorId: dbAccount.institution.providerConnectorId,
            }
        }

        return {
            type: dbAccount.type,
            name: dbAccount.name,
            balance: dbAccount.balance,
            imageUrl: dbAccount.imageUrl,
            userId: dbAccount.userId.toString(),
            id: dbAccount._id.toString(),
            institution,
        }
    }

}