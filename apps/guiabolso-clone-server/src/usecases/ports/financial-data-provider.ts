import { Either } from "@/shared"
import { InstitutionData } from "@/usecases/ports"
import { UnexpectedError } from "@/usecases/errors"

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
    getConnectToken(itemId?: string): Promise<Either<UnexpectedError, string>>
}