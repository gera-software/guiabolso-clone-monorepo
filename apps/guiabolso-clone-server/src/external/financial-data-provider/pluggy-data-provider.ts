import { PluggyClient } from 'pluggy-sdk'
import { FinancialDataProvider, InstitutionData } from "@/usecases/ports"
import { Either } from '@/shared'
import { UnauthenticatedError, UnexpectedError } from '@/usecases/errors'

export class PluggyDataProvider implements FinancialDataProvider {
    private client: PluggyClient

    constructor(clientId: string, clientSecret: string) {
        this.client = new PluggyClient({
            clientId,
            clientSecret,
        })
    }

    public async getAvailableAutomaticInstitutions(): Promise<InstitutionData[]> {
        console.log('[Pluggy] get available automatic institutions...')
        return this.client
                .fetchConnectors()
                .then((response) => response.results)
                .then((connectors) => {
                    return connectors.map((connector) => ({
                        id: null,
                        providerConnectorId: connector.id.toString(),
                        name: connector.name,
                        imageUrl: connector.imageUrl,
                        primaryColor: "#" + connector.primaryColor,
                        type: connector.type,
                    }));
                })
    }

    public async getConnectToken(itemId?: string): Promise<Either<UnauthenticatedError | UnexpectedError, string>> {
        throw new Error("Method not implemented.")
    }

}