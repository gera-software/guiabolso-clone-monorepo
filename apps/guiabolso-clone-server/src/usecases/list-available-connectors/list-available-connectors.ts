import { right } from "@/shared"
import { FinancialDataProvider, UseCase } from "@/usecases/ports"

export class ListAvailableConnectors implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider

    constructor(financialDataProvider: FinancialDataProvider) {
        this.financialDataProvider = financialDataProvider
    }

    async perform(request: any): Promise<any> {
        const result = await this.financialDataProvider.fetchConnectors()
        return right(result)
    }

}