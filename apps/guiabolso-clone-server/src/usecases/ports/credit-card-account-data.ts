import { CreditCardInfoData, InstitutionData } from "@/usecases/ports";

export interface CreditCardAccountData {
    type: string,
    syncType: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: string,
    institution?: InstitutionData,
    id?: string,
    creditCardInfo?: CreditCardInfoData,
    providerAccountId?: string,
    synchronization?: {
        providerItemId: string,
        createdAt: Date,
        syncStatus: string,
        lastSyncAt?: Date,
        lastMergeAt?: Date,
    },
}