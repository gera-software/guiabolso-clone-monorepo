import { Account } from "@/entities";

export interface AccountSynchonization {
    providerItemId: string,
    createdAt: Date,
}

export interface AutomaticAccount extends Account {
    providerAccountId: string
    synchonization: AccountSynchonization
}