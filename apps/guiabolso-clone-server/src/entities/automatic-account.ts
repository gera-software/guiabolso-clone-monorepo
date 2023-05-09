import { Account, Institution } from "@/entities";

export interface Accountsynchronization {
    providerItemId: string,
    createdAt: Date,
}

export interface AutomaticAccount extends Account {
    institution: Institution
    providerAccountId: string
    synchronization: Accountsynchronization
}