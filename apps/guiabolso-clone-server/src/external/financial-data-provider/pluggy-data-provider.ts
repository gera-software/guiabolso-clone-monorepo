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
        try {
            const item = await this.client.fetchItem(itemId)

            const institutionData: InstitutionData = {
                id: null,
                name: item.connector.name,
                type: item.connector.type,
                imageUrl: item.connector.imageUrl,
                primaryColor: item.connector.primaryColor,
                providerConnectorId: ''+item.connector.id,
            }

            const accountsArray = await this.client.fetchAccounts(itemId)

            const results = accountsArray.results.map(account => ({
                id: null,
                type: account.type == 'BANK' ? 'BANK' : 'CREDIT_CARD',
                syncType: 'AUTOMATIC',
                name: account.name,
                balance: account.type == 'BANK' ? account.balance :  -account.balance,
                imageUrl: item.connector.imageUrl,
                userId: null,
                institution: institutionData,
                creditCardInfo: account.type == 'BANK' ? null : {
                    brand: account.creditData.brand,
                    creditLimit: account.creditData.creditLimit,
                    availableCreditLimit: account.creditData.availableCreditLimit,
                    closeDay: account.creditData.balanceCloseDate.getUTCDate(),
                    dueDay: account.creditData.balanceDueDate.getUTCDate(),
                },
                providerAccountId: account.id,
                synchonization: {
                    providerItemId: item.id,
                    createdAt: item.createdAt,
                }
            }))

    
            return right(results)
        } catch (error: any) {
            return left(new UnexpectedError(error.message))
        }

    }
}