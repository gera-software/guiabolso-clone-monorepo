import { AccountType } from "@/entities"
import { Either, right } from "@/shared"
import { DataProviderError } from "@/usecases/errors"
import { InstitutionData, FinancialDataProvider, AccountData, TransactionFilter, TransactionRequest } from "@/usecases/ports"

export class InMemoryPluggyDataProvider implements FinancialDataProvider {
    private readonly _institutions: InstitutionData[]
    private readonly _accounts: AccountData[]
    private readonly _transactions: TransactionRequest[]

    constructor(options: { institutions?: InstitutionData[], accounts?: AccountData[], transactions?: TransactionRequest[] }) {
        this._institutions = options.institutions ?? []
        this._accounts = options.accounts ?? []
        this._transactions = options.transactions ?? []
    }

    public get institutions() {
        return this._institutions
    }

    public get accounts() {
        return this._accounts
    }

    public get transactions() {
        return this._transactions
    }

    public async getAvailableAutomaticInstitutions(): Promise<InstitutionData[]> {
        return this._institutions
    }

    public async getConnectToken(options: {itemId?: string, clientUserId?: string}): Promise<Either<DataProviderError, string>> {
        return right('valid-access-token')
    }

    public async getAccountsByItemId(itemId: string): Promise<Either<DataProviderError, AccountData[]>> {
        const accounts = this._accounts.filter(account => account.synchronization?.providerItemId == itemId )

        return right(accounts)
    }

    public async getTransactionsByProviderAccountId(accountId: string, accountType: AccountType, filter: TransactionFilter): Promise<Either<DataProviderError, TransactionRequest[]>> {
        return right(this._transactions)
    }

}