import { CreditCardInfoData, InstitutionData } from "@/usecases/ports"

export interface AccountData {
    id?: string,
    type: string,
    syncType: string,
    name: string
    balance: number
    imageUrl?: string
    userId: string
    institution?: InstitutionData
    creditCardInfo?: CreditCardInfoData,
    providerAccountId?: string,
    synchronization?: {
        providerItemId: string,
        createdAt: Date,
        syncStatus: string, 
        lastSyncAt?: Date,
        lastMergeAt?: Date,
        mergeStatus?: string,
    }
}