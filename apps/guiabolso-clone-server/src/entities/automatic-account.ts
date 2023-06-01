import { Account, Institution } from "@/entities";

export type ProviderSyncStatus = 'OUTDATED' | 'UPDATING' | 'UPDATED' | 'LOGIN_ERROR' | 'WAITING_USER_INPUT'
export type MergeStatus = null | 'MERGED' | 'MERGE_ERROR'


export interface Accountsynchronization {
    providerItemId: string,
    createdAt: Date,
    syncStatus: ProviderSyncStatus,
    lastSyncAt: Date | null | undefined,
    mergeStatus?: MergeStatus,
    lastMergeAt?: Date
}

export interface AutomaticAccount extends Account {
    institution: Institution
    providerAccountId: string
    synchronization: Accountsynchronization
}