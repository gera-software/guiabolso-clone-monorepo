import { AccountData, CreditCardInfoData } from "@/usecases/ports"

export interface AccountRepository {
    add(account: AccountData): Promise<AccountData>
    findById(id: string): Promise<AccountData>
    exists(id: string): Promise<boolean>
}

export interface UpdateAccountRepository extends AccountRepository {
    updateBalance(accountId: string, balance: number): Promise<void>
    updateSynchronizationStatus(accountId: string, synchronization: { syncStatus: string, lastSyncAt?: Date, lastMergeAt?: Date, mergeStatus?: string }): Promise<void>
    updateAvaliableCreditCardLimit(accountId: string, limit: number): Promise<void>
    updateCreditCardInfo(accountId: string, creditCardInfoData: CreditCardInfoData): Promise<void>
}