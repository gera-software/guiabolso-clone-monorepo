import { Either } from "@/shared";
import { FinancialDataProvider, UseCase } from "@/usecases/ports";
import { DataProviderError } from "@/usecases/errors";

export class PluggyConnectWidgetCreateToken implements UseCase {
    private pluggyDataProvider: FinancialDataProvider

    constructor(pluggyDataProvider: FinancialDataProvider) {
        this.pluggyDataProvider = pluggyDataProvider
    }

    async perform({ itemId }: { itemId?: string }): Promise<Either<DataProviderError, string>> {

        const connectToken = await this.pluggyDataProvider.getConnectToken({itemId})
        return connectToken
    }

}