import api from '../config/axios.js'

type ProviderExecutionStatus = 'SUCCESS' | 'PENDENTE'

type ProviderAccountStatus = {
    executionStatus: ProviderExecutionStatus,
    lastUpdatedAt: Date | null | undefined,
}

export type ProviderItemStatus = {
    bankAccounts: ProviderAccountStatus,
    creditCardAccounts: ProviderAccountStatus,
}

async function connectAutomaticAccounts(itemId: string, userId: string, syncStatus?: ProviderItemStatus) {
    return api.guiabolsoServer({
        method: 'post',
        url: 'connect-accounts',
        data: {
            itemId,
            userId,
        }
    }).then((response) => {
        console.log(response)
        return response.data
    })
}

export default {
    connectAutomaticAccounts,
}