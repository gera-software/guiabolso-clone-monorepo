import { PluggyClient } from 'pluggy-sdk'
import { FinancialDataProvider, InstitutionData } from "@/usecases/ports"

export class PluggyDataProvider implements FinancialDataProvider {
    private client: PluggyClient

    constructor(clientId: string, clientSecret: string) {
        this.client = new PluggyClient({
            clientId,
            clientSecret,
        })
    }

    async getAvailableAutomaticInstitutions(): Promise<InstitutionData[]> {
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

}