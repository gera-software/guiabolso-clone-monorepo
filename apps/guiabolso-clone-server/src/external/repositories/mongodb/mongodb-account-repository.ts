import { AccountData, AccountRepository, CreditCardInfoData, InstitutionData, UpdateAccountRepository } from "@/usecases/ports"
import { ObjectId } from "mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { MongodbInstitution } from "@/external/repositories/mongodb"
import { MergeStatus, ProviderSyncStatus } from "@/entities"

export type MongodbCreditCardInfo = {
    brand: string,
    creditLimit: number,
    availableCreditLimit: number,
    closeDay: number,
    dueDay: number,
}

export type MongodbAccountSynchronization = {
    providerItemId: string,
    createdAt: Date,
    syncStatus: string,
    lastSyncAt?: Date,
    mergeStatus?: string,
    lastMergeAt?: Date,
}

export type MongodbAccount = {
    type: string,
    syncType: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: ObjectId,
    _id?: ObjectId,
    institution?: MongodbInstitution,
    creditCardInfo?: MongodbCreditCardInfo,
    providerAccountId?: string,
    synchronization?: MongodbAccountSynchronization,
}


export class MongodbAccountRepository implements AccountRepository, UpdateAccountRepository {

    async add(account: AccountData): Promise<AccountData> {
        const accountCollection = MongoHelper.getCollection('accounts')

        const accountClone: MongodbAccount = {
            type: account.type,
            syncType: account.syncType,
            name: account.name,
            balance: account.balance,
            imageUrl: account.imageUrl,
            userId: new ObjectId(account.userId),
            institution: null as any,
            creditCardInfo: null as any,
            providerAccountId: account.providerAccountId,
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

        if(account.creditCardInfo) {
            accountClone.creditCardInfo = account.creditCardInfo
        }

        if(account.synchronization) {
            accountClone.synchronization = account.synchronization
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

    async updateBalance(accountId: string, balance: number): Promise<void> {
        const accountCollection = MongoHelper.getCollection('accounts')

        const updateDoc = {
            $set: {
              balance,
            },
        };

        await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)
    }

    async updateCreditCardInfo(accountId: string, creditCardInfoData: CreditCardInfoData): Promise<void> {
        const accountCollection = MongoHelper.getCollection('accounts')

        const updateDoc = {
            $set: {
                creditCardInfo: creditCardInfoData,
            },
        };

        await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)
    }

    async updateAvaliableCreditCardLimit(accountId: string, limit: number): Promise<void> {
        const accountCollection = MongoHelper.getCollection('accounts')

        const updateDoc = {
            $set: {
                'creditCardInfo.availableCreditLimit': limit,
            },
        };

        await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)
    }

    // TODO refactor, maybe use bulk?
    async updateSynchronizationStatus(accountId: string, synchronization: { syncStatus: string, lastSyncAt?: Date, lastMergeAt?: Date, mergeStatus?: string }): Promise<void> {
        const accountCollection = MongoHelper.getCollection('accounts')
    
        if(synchronization.syncStatus) {
            const updateDoc = {
                $set: {
                    'synchronization.syncStatus': synchronization.syncStatus,
                }
            }
            await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)
        }

        if(synchronization.lastSyncAt) {
            const updateDoc = {
                $set: {
                    'synchronization.lastSyncAt': synchronization.lastSyncAt,
                }
            }
            await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)
          
        } 
        
        if(synchronization.lastMergeAt){
            const updateDoc = {
                $set: {
                    'synchronization.lastMergeAt': synchronization.lastMergeAt,
                }
            }
            await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)
        }

        const updateDoc = {
            $set: {
                'synchronization.mergeStatus': synchronization.mergeStatus,
            }
        }
        await accountCollection.updateOne({ _id: new ObjectId(accountId) }, updateDoc)

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

        let creditCardInfo: CreditCardInfoData = null

        if(dbAccount.creditCardInfo) {
            creditCardInfo = dbAccount.creditCardInfo
        }

        let synchronization: AccountData['synchronization'] = null
        if(dbAccount.synchronization) {
            synchronization = {
                providerItemId: dbAccount.synchronization.providerItemId,
                createdAt: dbAccount.synchronization.createdAt,
                syncStatus: dbAccount.synchronization.syncStatus as ProviderSyncStatus,
                lastSyncAt: dbAccount.synchronization.lastSyncAt,
                mergeStatus: dbAccount.synchronization.mergeStatus as MergeStatus,
                lastMergeAt: dbAccount.synchronization.lastMergeAt,
            }
            dbAccount.synchronization
        }

        return {
            type: dbAccount.type,
            syncType: dbAccount.syncType,
            name: dbAccount.name,
            balance: dbAccount.balance,
            imageUrl: dbAccount.imageUrl,
            userId: dbAccount.userId.toString(),
            id: dbAccount._id.toString(),
            institution,
            creditCardInfo,
            providerAccountId: dbAccount.providerAccountId,
            synchronization,
        }
    }

}