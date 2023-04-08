import { PluggyClient } from 'pluggy-sdk'
import { ConnectorData, FinancialDataProvider } from "@/usecases/ports"

export class PluggyDataProvider implements FinancialDataProvider {
    private client: PluggyClient

    constructor(clientId: string, clientSecret: string) {
        this.client = new PluggyClient({
            clientId,
            clientSecret,
        })
    }

    async fetchConnectors(): Promise<ConnectorData[]> {
        console.log('[Pluggy] fetch connectors...')
        return this.client
                .fetchConnectors()
                .then((response) => response.results)
                .then((connectors) => {
                    return connectors.map((connector) => ({
                        providerConnectorId: connector.id.toString(),
                        name: connector.name,
                        imageUrl: connector.imageUrl,
                        primaryColor: "#" + connector.primaryColor,
                        type: connector.type,
                    }));
                })
    }

}