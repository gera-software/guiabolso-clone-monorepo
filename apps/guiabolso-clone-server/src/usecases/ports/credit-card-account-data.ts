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
    synchonization?: {
        providerItemId: string,
        createdAt: Date,
    },
}