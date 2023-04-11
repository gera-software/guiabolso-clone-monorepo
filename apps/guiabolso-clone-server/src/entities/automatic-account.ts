import { Account, Institution } from "@/entities";

export interface AccountSynchonization {
    providerItemId: string,
    createdAt: Date,
}

export interface AutomaticAccount extends Account {
    institution: Institution
    providerAccountId: string
    synchonization: AccountSynchonization
}