import { InstitutionData } from "@/usecases/ports"

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
}