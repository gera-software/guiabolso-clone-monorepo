import { Item } from "pluggy-sdk"
import serverApiWrapper, { ProviderItemStatus } from "./serverApiWrapper"

export async function createAutomaticAccounts(item: Item, userId: string) {
    console.log('createAutomaticAccounts')
    const syncStatus: ProviderItemStatus = {
        bankAccounts: {
            executionStatus: "PENDENTE",
            lastUpdatedAt: null
        },
        creditCardAccounts: {
            executionStatus: "PENDENTE",
            lastUpdatedAt: null
        }
    }

    if(item.status == 'UPDATED') {
        if(item.executionStatus == 'SUCCESS') {
            console.log(`[PLUGGY] UPDATED with SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`)
            syncStatus.bankAccounts.executionStatus = 'SUCCESS'
            syncStatus.bankAccounts.lastUpdatedAt = item.lastUpdatedAt

            syncStatus.creditCardAccounts.executionStatus = 'SUCCESS'
            syncStatus.creditCardAccounts.lastUpdatedAt = item.lastUpdatedAt

        } else if(item.executionStatus == 'PARTIAL_SUCCESS') {
            console.log(`[PLUGGY] UPDATED with PARTIAL_SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`, item.statusDetail)
            syncStatus.bankAccounts.executionStatus = item.statusDetail?.accounts?.isUpdated ? 'SUCCESS' : 'PENDENTE'
            syncStatus.bankAccounts.lastUpdatedAt = item.statusDetail?.accounts?.lastUpdatedAt

            syncStatus.creditCardAccounts.executionStatus = item.statusDetail?.creditCards?.isUpdated ? 'SUCCESS' : 'PENDENTE'
            syncStatus.creditCardAccounts.lastUpdatedAt = item.statusDetail?.creditCards?.lastUpdatedAt
        }
        
        return serverApiWrapper.connectAutomaticAccounts(item.id,  userId, syncStatus)
    }

}
