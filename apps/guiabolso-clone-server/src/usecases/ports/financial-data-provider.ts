import { Either } from "@/shared"
import { InstitutionData } from "@/usecases/ports"
import { UnauthenticatedError, UnexpectedError } from "@/usecases/errors"

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
    getConnectToken(itemId?: string): Promise<Either<UnexpectedError, string>>
}