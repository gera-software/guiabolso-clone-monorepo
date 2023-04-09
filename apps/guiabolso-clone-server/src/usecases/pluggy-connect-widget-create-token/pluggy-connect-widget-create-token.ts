import { FinancialDataProvider, UseCase } from "@/usecases/ports";

export class PluggyConnectWidgetCreateToken implements UseCase {
    private pluggyDataProvider: FinancialDataProvider

    constructor(pluggyDataProvider: FinancialDataProvider) {
        this.pluggyDataProvider = pluggyDataProvider
    }

    async perform(request: any): Promise<any> {
        const connectToken = await this.pluggyDataProvider.getConnectToken()
        return connectToken
    }

}