import { left, right } from "@/shared"
import { InvalidNameError, InvalidTypeError } from "./errors"

export type InstitutionType = 'INVESTMENT' | 'PERSONAL_BANK' | 'BUSINESS_BANK'

export class Institution {
    public readonly id: string
    public readonly name: string
    public readonly type: InstitutionType
    public readonly imageUrl?: string
    public readonly primaryColor?: string
    public readonly providerConnectorId?: string

    private constructor(institutionData: {id: string, name: string, type: InstitutionType, imageUrl?: string, primaryColor?: string, providerConnectorId?: string}) {
        this.id = institutionData.id
        this.name = institutionData.name
        this.type = institutionData.type
        this.imageUrl = institutionData.imageUrl
        this.primaryColor = institutionData.primaryColor
        this.providerConnectorId = institutionData.providerConnectorId
    }

    public static create(institutionData: {id: string, name: string, type: InstitutionType, imageUrl?: string, primaryColor?: string, providerConnectorId?: string}) {
        const { name, type } = institutionData

        if(!name) {
            return left(new InvalidNameError())
        }

        if(!type) {
            return left(new InvalidTypeError())
        }

        return right(new Institution(institutionData))
    }
}