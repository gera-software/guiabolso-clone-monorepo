import { Either, left } from "@/shared"
import { UnexpectedError } from "@/usecases/errors"
import { InstitutionData, FinancialDataProvider, AccountData } from "@/usecases/ports"

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

    public async getConnectToken(itemId?: string): Promise<Either<UnexpectedError, string>> {
        return left(new UnexpectedError('erro inesperado'))
    }

    public async getAccountsByItemId(itemId: string): Promise<Either<UnexpectedError, AccountData[]>> {
        return left(new UnexpectedError('erro inesperado'))
    }

}