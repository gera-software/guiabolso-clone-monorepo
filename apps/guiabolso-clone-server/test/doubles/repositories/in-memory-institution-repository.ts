import { InstitutionData, InstitutionRepository } from "@/usecases/ports";

export class InMemoryInstitutionRepository implements InstitutionRepository {
    private readonly _data: InstitutionData[]
    private idCounter: number = 0

    constructor (data: InstitutionData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    async findById(id: string): Promise<InstitutionData> {
        const institution = this.data.find(institution => institution.id == id)
        return institution || null
    }

    async fetchByType(type: string): Promise<InstitutionData[]> {
        const institutions = this.data.filter(institution => institution.type == type)
        return institutions
    }

    async exists(id: string): Promise<boolean> {
        const found = await this.findById(id)
        if(found) {
            return true
        }

        return false
    }

    async findByProviderConnectorIdAndUpdate(institutionToUpdate: InstitutionData): Promise<InstitutionData> {
        const inst = this.data.find(institution => institution.providerConnectorId == institutionToUpdate.providerConnectorId)

        if(inst) {
            inst.imageUrl = institutionToUpdate.imageUrl
            inst.name = institutionToUpdate.name
            inst.primaryColor = institutionToUpdate.primaryColor
            inst.type = institutionToUpdate.type

            return inst
        }

        const newInstitution: InstitutionData = {
            id: ''+this.idCounter++,
            imageUrl: institutionToUpdate.imageUrl,
            name: institutionToUpdate.name,
            primaryColor: institutionToUpdate.primaryColor,
            type: institutionToUpdate.type,
            providerConnectorId: institutionToUpdate.providerConnectorId
        }

        this.data.push(newInstitution)

        return newInstitution

    }

}