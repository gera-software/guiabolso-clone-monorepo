import { InstitutionData, FinancialDataProvider } from "@/usecases/ports"

export class InMemoryPluggyDataProvider implements FinancialDataProvider {
    private readonly _data: InstitutionData[]

    constructor(data: InstitutionData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    public async getAvailableAutomaticInstitutions(): Promise<InstitutionData[]> {
        return this._data
    }

}