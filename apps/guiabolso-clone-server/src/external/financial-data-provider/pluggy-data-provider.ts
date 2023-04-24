import { PluggyClient } from 'pluggy-sdk'
import { AccountData, FinancialDataProvider, InstitutionData } from "@/usecases/ports"
import { Either, left, right } from '@/shared'
import { UnexpectedError } from '@/usecases/errors'

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

    public async getConnectToken(itemId?: string): Promise<Either<UnexpectedError, string>> {
        try {
            const result = await this.client.createConnectToken(itemId)
            return right(result.accessToken)
        } catch(error) {
            return left(new UnexpectedError())
        }
    }

    public async getAccountsByItemId(itemId: string): Promise<Either<UnexpectedError, AccountData[]>> {
        throw new Error('Method getAccountsByItemId not implemented.')
    }

    public async getInstitution(providerConnectorId: number): Promise<Either<UnexpectedError, InstitutionData>> {
        throw new Error('Method getInstitution not implemented.')
    }

}