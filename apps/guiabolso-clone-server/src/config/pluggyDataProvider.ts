import { PluggyClient, Transaction as PluggyTransaction, Account as PluggyAccount, Item as PluggyItem, PageResponse } from 'pluggy-sdk';

import { DataProvider, Institution, InstitutionType } from '../types'

class PluggyDataProvider implements DataProvider {
    private client : PluggyClient

    constructor() {
        this.client = new PluggyClient({
            clientId: process.env.VITE_PLUGGY_CLIENT_ID ?? '',
            clientSecret: process.env.VITE_PLUGGY_CLIENT_SECRET ?? '',
        });
    }

    async createConnectToken(itemId: string | undefined) {
        return this.client.createConnectToken(itemId)
    }

    /**
     * Retorna apenas os conectores online disponíveis para conexão no momento
     * @returns 
     */
    async fetchInstitutions(): Promise<Institution[]> {
        console.log('[Pluggy] fetchInstitutions...')
        return this.client
                .fetchConnectors()
                .then((response) => response.results)
                .then((connectors) => {
                    return connectors.map((connector) => ({
                        pluggyConnectorId: connector.id,
                        name: connector.name,
                        imageUrl: connector.imageUrl,
                        primaryColor: "#" + connector.primaryColor,
                        type: connector.type as InstitutionType,
                    }));
                })
    }

    /**
     * Retorna todas as transações de uma account, a partir de uma determinada data
     * @param pluggyAccountId 
     * @param from 
     * @returns 
     */
    async fetchTransactions(pluggyAccountId: string, from: string ): Promise<PluggyTransaction[]> {
        console.log('[Pluggy] fetchTransactions...')

        // const pluggyAccountId = '100e848a-22e7-491e-bebc-a3c489df7893'
        const pageSize = 10
        // const from = '2022-11-01'

        let transactions: PluggyTransaction[]  = []

        let response: PageResponse<PluggyTransaction>;

        let page = 1
        let totalPages = 1
        do {
            response = await this.client.fetchTransactions(
                pluggyAccountId,
                {
                    from,
                    pageSize,
                    page,
                }
            )  
    
            transactions.push(...response.results)
            // console.log(response.results);
            // console.log(response.total)
            // console.log(response.totalPages)
            // console.log(response.page)

            // @ts-ignore
            totalPages = +response.totalPages
            // @ts-ignore
            page = +response.page + 1
        } while(page <= totalPages)

        return transactions
    }

    async getAccount(pluggyAccountId: string): Promise<PluggyAccount> {
        console.log('[Pluggy] get account...')
        return this.client
                .fetchAccount(pluggyAccountId)
                .then((account) => account)
    }

    /**
     * Request an item to start update process in background
     * @param id 
     * @returns 
     */
    async updateItem(id: string): Promise<PluggyItem> {
        console.log('[Pluggy] updateItems...')
        return this.client
            .updateItem(id)
    }
}

export default PluggyDataProvider