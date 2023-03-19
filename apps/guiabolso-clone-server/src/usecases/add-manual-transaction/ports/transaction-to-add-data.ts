import { AccountData, CategoryData, UserData } from "@/usecases/ports"

export type TransactionToAddData = {
    user: UserData, 
    account: AccountData, 
    category?: CategoryData, 
    amount: number,
    description?: string,
    date: Date,
    comment?: string,
    ignored?: boolean
}