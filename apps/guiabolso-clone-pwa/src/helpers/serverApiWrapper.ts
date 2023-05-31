import api from '../config/axios.js'

type ProviderSyncStatus = 'UPDATED' | 'OUTDATED'

type ProviderAccountSyncDetails = {
    syncStatus: ProviderSyncStatus,
    lastSyncAt: Date | null | undefined,
}

export type ProviderItemStatus = {
    bankAccounts: ProviderAccountSyncDetails,
    creditCardAccounts: ProviderAccountSyncDetails,
}

/**
 * @deprecated
 * @param itemId 
 * @param userId 
 * @param syncStatus 
 * @returns 
 */
async function connectAutomaticAccounts(itemId: string, userId: string, syncStatus?: ProviderItemStatus) {
    return api.guiabolsoServer({
        method: 'post',
        url: 'connect-accounts',
        data: {
            itemId,
            userId,
            syncStatus,
        }
    }).then((response) => {
        console.log(response)
        return response.data
    })
}

export default {
    connectAutomaticAccounts,
}