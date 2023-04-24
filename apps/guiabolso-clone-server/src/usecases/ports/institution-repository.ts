import { InstitutionData } from "@/usecases/ports"

export interface InstitutionRepository {
    findById(id: string): Promise<InstitutionData>
    fetchByType(type: string): Promise<InstitutionData[]>
    exists(id: string): Promise<boolean>
    findByProviderConnectorIdAndUpdate(institution: InstitutionData): Promise<InstitutionData>
}