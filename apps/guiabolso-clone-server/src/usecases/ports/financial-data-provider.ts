import { Either } from "@/shared"
import { AccountData, InstitutionData } from "@/usecases/ports"
import { UnexpectedError } from "@/usecases/errors"

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
    getConnectToken(itemId?: string): Promise<Either<UnexpectedError, string>>
    getAccountsByItemId(itemId: string): Promise<Either<UnexpectedError, AccountData[]>>
    getInstitution(providerConnectorId: number): Promise<Either<UnexpectedError, InstitutionData>>
}