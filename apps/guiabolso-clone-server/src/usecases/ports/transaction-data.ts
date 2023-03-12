import { CategoryData } from "@/usecases/ports"

export interface TransactionData {
    id?: string,
    accountId: string,
    accountType: string,
    syncType: string,
    userId: string,
    category?: CategoryData,
    amount: number,
    description?: string,
    descriptionOriginal?: string,
    date: Date,
    type: string,
    comment?: string,
    ignored?: boolean,
}