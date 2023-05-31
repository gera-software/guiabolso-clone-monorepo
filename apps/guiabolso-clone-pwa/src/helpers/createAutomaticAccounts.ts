import { Item } from "pluggy-sdk"
import serverApiWrapper, { ProviderItemStatus } from "./serverApiWrapper"

export async function createAutomaticAccounts(item: Item, userId: string) {
    console.log('createAutomaticAccounts')
    const syncStatus: ProviderItemStatus = {
        bankAccounts: {
            syncStatus: "OUTDATED",
            lastSyncAt: null
        },
        creditCardAccounts: {
            syncStatus: "OUTDATED",
            lastSyncAt: null
        }
    }

    if(item.status == 'UPDATED') {
        if(item.executionStatus == 'SUCCESS') {
            console.log(`[PLUGGY] UPDATED with SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`)
            syncStatus.bankAccounts.syncStatus = 'UPDATED'
            syncStatus.bankAccounts.lastSyncAt = item.lastUpdatedAt

            syncStatus.creditCardAccounts.syncStatus = 'UPDATED'
            syncStatus.creditCardAccounts.lastSyncAt = item.lastUpdatedAt

        } else if(item.executionStatus == 'PARTIAL_SUCCESS') {
            console.log(`[PLUGGY] UPDATED with PARTIAL_SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`, item.statusDetail)
            syncStatus.bankAccounts.syncStatus = item.statusDetail?.accounts?.isUpdated ? 'UPDATED' : 'OUTDATED'
            syncStatus.bankAccounts.lastSyncAt = item.statusDetail?.accounts?.lastUpdatedAt

            syncStatus.creditCardAccounts.syncStatus = item.statusDetail?.creditCards?.isUpdated ? 'UPDATED' : 'OUTDATED'
            syncStatus.creditCardAccounts.lastSyncAt = item.statusDetail?.creditCards?.lastUpdatedAt
        }

        return serverApiWrapper.connectAutomaticAccounts(item.id,  userId, syncStatus)
    }

}
