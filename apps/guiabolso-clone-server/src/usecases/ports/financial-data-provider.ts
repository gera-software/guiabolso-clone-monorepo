import { Either } from "@/shared"
import { AccountData, InstitutionData, TransactionRequest } from "@/usecases/ports"
import { DataProviderError } from "@/usecases/errors"
import { AccountType } from "@/entities"

export type TransactionFilter = {
    providerAccountId: string, 
    from: Date, 
    to?: Date,
}

export interface FinancialDataProvider {
    getAvailableAutomaticInstitutions(): Promise<InstitutionData[]>
    getConnectToken(itemId?: string): Promise<Either<DataProviderError, string>>
    getAccountsByItemId(itemId: string): Promise<Either<DataProviderError, AccountData[]>>
    getTransactionsByProviderAccountId(accountId: string, accountType: AccountType, filter: TransactionFilter): Promise<Either<DataProviderError, TransactionRequest[]>>
}