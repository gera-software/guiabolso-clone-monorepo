import { ConnectTokenOptions, PluggyClient, Transaction as PluggyTransaction, TransactionFilters } from 'pluggy-sdk'
import { AccountData, FinancialDataProvider, InstitutionData, TransactionFilter, TransactionRequest } from "@/usecases/ports"
import { Either, left, right } from '@/shared'
import { DataProviderError } from '@/usecases/errors'
import { AccountType } from '@/entities'

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
                .fetchConnectors({ types: [ 'PERSONAL_BANK' ], sandbox: true })
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

    public async getConnectToken({ itemId, clientUserId }: { itemId?: string, clientUserId?: string}): Promise<Either<DataProviderError, string>> {
        try {
            const options: ConnectTokenOptions = {}
            if(clientUserId) {
                options.clientUserId = clientUserId
            }
            const result = await this.client.createConnectToken(itemId, options)
            return right(result.accessToken)
        } catch(error) {
            return left(new DataProviderError(error.toString()))
        }
    }

    public async getAccountsByItemId(itemId: string): Promise<Either<DataProviderError, AccountData[]>> { 
        try {
            const item = await this.client.fetchItem(itemId)
            console.log('item', item)

            const institutionData: InstitutionData = {
                id: null,
                name: item.connector.name,
                type: item.connector.type,
                imageUrl: item.connector.imageUrl,
                primaryColor: item.connector.primaryColor,
                providerConnectorId: ''+item.connector.id,
            }
            console.log('institutionData', institutionData)

            const accountsArray = await this.client.fetchAccounts(itemId)
            for(const account of accountsArray.results) {
                console.log('accountsArray', account)
            }

            const results = accountsArray.results.map(account => {
                const signal = account.type == 'CREDIT' ? -1 : 1
                return {
                    id: null,
                    type: account.type == 'BANK' ? 'BANK' : 'CREDIT_CARD',
                    syncType: 'AUTOMATIC',
                    name: account.name,
                    balance: +(account.balance * 100).toFixed(0) * signal,
                    imageUrl: item.connector.imageUrl,
                    userId: null,
                    institution: institutionData,
                    creditCardInfo: account.type == 'BANK' ? null : {
                        brand: account.creditData.brand,
                        creditLimit: +(account.creditData.creditLimit * 100).toFixed(0),
                        availableCreditLimit: +(account.creditData.availableCreditLimit * 100).toFixed(0),
                        closeDay: account.creditData.balanceCloseDate.getUTCDate(),
                        dueDay: account.creditData.balanceDueDate.getUTCDate(),
                    },
                    providerAccountId: account.id,
                    synchronization: {
                        providerItemId: item.id,
                        createdAt: item.createdAt,
                    }
                }
            })

            for(const account of results) {
                console.log('results', account)
            }

    
            return right(results)
        } catch (error: any) {
            return left(new DataProviderError(error.message))
        }

    }

    public async getTransactionsByProviderAccountId(accountId: string, accountType: AccountType, filter: TransactionFilter): Promise<Either<DataProviderError, TransactionRequest[]>> {
        try {
            const buffer = []

            
            let numeroTotalPages = 1
            for(let currentPage = 1; currentPage <= numeroTotalPages; currentPage++) {
                const options: TransactionFilters = {
                    page: currentPage
                }
    
                if(filter.from) {
                    options.from = filter.from.toISOString().slice(0, 10)
                }
                if(filter.to) {
                    options.to = filter.to.toISOString().slice(0, 10)
                }
                const { results, page, totalPages, total } = await this.client.fetchTransactions(filter.providerAccountId, options)
                buffer.push(...results)
                console.log(`[Pluggy] Fetching transactions. total processado: ${buffer.length}, total estimado: ${total}, currentPage: ${page}/${totalPages}`)
                
                numeroTotalPages = totalPages
            }

           

            const signal = accountType == 'CREDIT_CARD' ? -1 : 1

            const transactions: TransactionRequest[] = buffer.map((transaction: PluggyTransaction) => ({
                id: null,
                accountId,
                amount: +(transaction.amount * 100).toFixed(0) * signal,
                descriptionOriginal: transaction.description,
                date: transaction.date,
                providerId: transaction.id,
            }))
            
            return right(transactions)

        } catch (error: any) {
            return left(new DataProviderError(error.message))
        }
    }
}