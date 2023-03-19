import { AccountData, CategoryData, UserData } from "@/usecases/ports"

export type TransactionToAddData = {
    userData: UserData, 
    accountData: AccountData, 
    categoryData?: CategoryData, 
    amount: number,
    description?: string,
    date: Date,
    comment?: string,
    ignored?: boolean
}