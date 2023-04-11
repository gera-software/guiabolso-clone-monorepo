import { InstitutionData } from "@/usecases/ports";

export interface BankAccountData {
    type: string,
    syncType: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: string,
    institution?: InstitutionData,
    id?: string,
    providerAccountId?: string,
    synchonization?: {
        providerItemId: string,
        createdAt: Date,
    },
}