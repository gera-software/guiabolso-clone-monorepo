import { InstitutionData, InstitutionRepository } from "@/usecases/ports"
import { ObjectId } from "mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"

export type MongodbInstitution = {
    _id: ObjectId,
    name: string, 
    type: string, 
    imageUrl?: string, 
    primaryColor?: string,
    providerConnectorId?: string,
}

export class MongodbInstitutionRepository implements InstitutionRepository {

    async findById(id: string): Promise<InstitutionData> {
        const institutionCollection = MongoHelper.getCollection('institutions')
        const institution = await institutionCollection.findOne<MongodbInstitution>({ _id: new ObjectId(id) })
        if(institution) {
            return this.withApplicationId(institution)
        }
        return null

    }

    async fetchByType(type: string): Promise<InstitutionData[]> {
        const institutionCollection = MongoHelper.getCollection('institutions')
        const institution = await institutionCollection.find<MongodbInstitution>({ type })
            .toArray()

        return institution.map(institution => this.withApplicationId(institution))
    }

    async exists(id: string): Promise<boolean> {
        const result = await this.findById(id)
        if(result != null) {
            return true
        }
        return false
    }

    private withApplicationId (dbInstitution: MongodbInstitution): InstitutionData {
        return {
            id: dbInstitution._id.toString(),
            name: dbInstitution.name,
            type: dbInstitution.type,
            imageUrl: dbInstitution.imageUrl, 
            primaryColor: dbInstitution.primaryColor,
            providerConnectorId: dbInstitution.providerConnectorId,
        }
    }

}