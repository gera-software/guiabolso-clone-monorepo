import { Either } from "@/shared"
import { AccountData, InstitutionData } from "@/usecases/ports"
import { DataProviderError, UnexpectedError } from "@/usecases/errors"

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
    getConnectToken(itemId?: string): Promise<Either<DataProviderError, string>>
    getAccountsByItemId(itemId: string): Promise<Either<UnexpectedError, AccountData[]>>
}