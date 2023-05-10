import { Either, right } from "@/shared"
import { DataProviderError } from "@/usecases/errors"
import { InstitutionData, FinancialDataProvider, AccountData } from "@/usecases/ports"

export class InMemoryPluggyDataProvider implements FinancialDataProvider {
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

    public async getConnectToken(itemId?: string): Promise<Either<DataProviderError, string>> {
        return right('valid-access-token')
    }

    public async getAccountsByItemId(itemId: string): Promise<Either<DataProviderError, AccountData[]>> {
        const accounts = this._accounts.filter(account => account.synchronization?.providerItemId == itemId )

        return right(accounts)
    }

}