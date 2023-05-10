import { Either } from "@/shared"
import { AccountData, InstitutionData, TransactionData } from "@/usecases/ports"
import { DataProviderError } from "@/usecases/errors"

export type TransactionFilter = {
    providerAccountId: string, 
    from: Date, 
    to?: Date,
}

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
    getConnectToken(itemId?: string): Promise<Either<DataProviderError, string>>
    getAccountsByItemId(itemId: string): Promise<Either<DataProviderError, AccountData[]>>
    getTransactionsByProviderAccountId(filter: TransactionFilter): Promise<Either<DataProviderError, TransactionData[]>>
}