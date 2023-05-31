import { Account, Institution } from "@/entities";

export type ProviderSyncStatus = 'UPDATED' | 'OUTDATED'

export interface Accountsynchronization {
    providerItemId: string,
    createdAt: Date,
    syncStatus: ProviderSyncStatus,
    lastSyncAt: Date | null | undefined,
}

export interface AutomaticAccount extends Account {
    institution: Institution
    providerAccountId: string
    synchronization: Accountsynchronization
}