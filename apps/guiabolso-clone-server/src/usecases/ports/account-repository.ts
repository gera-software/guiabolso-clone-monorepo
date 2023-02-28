import { AccountData } from "@/usecases/ports"

export interface AccountRepository {
    add(account: AccountData): Promise<AccountData>
    findById(id: string): Promise<AccountData>
    // fetchByUser(userId: string): Promise<AccountData[]>
    exists(id: string): Promise<boolean>
}