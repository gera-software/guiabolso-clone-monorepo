import { Item } from "pluggy-sdk"
import api from '../config/axios.js'

async function connectAutomaticAccounts(itemId: string, userId: string) {
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

export function sum(a: number, b: number) {
    return a + b
}

export async function createAutomaticAccounts(item: Item, userId: string) {
    console.log('createAutomaticAccounts')
    if(item.status == 'UPDATED') {
        if(item.executionStatus == 'SUCCESS') {
            console.log(`[PLUGGY] UPDATED with SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`)
        } else if(item.executionStatus == 'PARTIAL_SUCCESS') {
            // @ts-ignore
            console.log(`[PLUGGY] UPDATED with PARTIAL_SUCCESS at ${item.lastUpdatedAt?.toLocaleString()}`, item.statusDetail)
        }
    }

    return connectAutomaticAccounts(item.id,  userId)
}