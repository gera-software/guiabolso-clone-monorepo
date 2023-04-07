import { ConnectorData, FinancialDataProvider } from "@/usecases/ports"

export class InMemoryPluggyDataProvider implements FinancialDataProvider {
    private readonly _data: ConnectorData[]

    constructor(data: ConnectorData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    public async fetchConnectors(): Promise<ConnectorData[]> {
        return this._data
    }

}