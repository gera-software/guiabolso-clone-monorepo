import { AccountType } from "@/entities"
import { Either, left } from "@/shared"
import { DataProviderError } from "@/usecases/errors"
import { InstitutionData, FinancialDataProvider, AccountData, TransactionFilter, TransactionRequest } from "@/usecases/ports"

export class ErrorPluggyDataProvider implements FinancialDataProvider {
    private readonly _institutions: InstitutionData[]
    private readonly _accounts: AccountData[]

    constructor(options: { institutions?: InstitutionData[], accounts?: AccountData[] }) {
        this._institutions = options.institutions ?? []
        this._accounts = options.accounts ?? []
    }

    public get institutions() {
        return this._institutions
    }

    public get accounts() {
        return this._accounts
    }

    public async getAvailableAutomaticInstitutions(): Promise<InstitutionData[]> {
        return this._institutions
    }

    public async getConnectToken(options: {itemId?: string, clientUserId?: string}): Promise<Either<DataProviderError, string>> {
        return left(new DataProviderError('erro inesperado'))
    }

    public async getAccountsByItemId(itemId: string): Promise<Either<DataProviderError, AccountData[]>> {
        return left(new DataProviderError('erro inesperado'))
    }

    public async getTransactionsByProviderAccountId(accountId: string, accountType: AccountType, filter: TransactionFilter): Promise<Either<DataProviderError, TransactionRequest[]>> {
        return left(new DataProviderError('erro inesperado'))
    }


}