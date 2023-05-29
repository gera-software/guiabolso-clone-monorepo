import { Item } from "pluggy-sdk"
import serverApiWrapper from "./serverApiWrapper"

export async function createAutomaticAccounts(item: Item, userId: string) {
    console.log('createAutomaticAccounts')
    if(item.status == 'UPDATED') {
        if(item.executionStatus == 'SUCCESS') {
            console.log(`[PLUGGY] UPDATED with SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`)
        } else if(item.executionStatus == 'PARTIAL_SUCCESS') {
            console.log(`[PLUGGY] UPDATED with PARTIAL_SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`, item.statusDetail)
        }
    }

    return serverApiWrapper.connectAutomaticAccounts(item.id,  userId)
}
