import { Amount, User } from "@/entities"


export type AccountType = 'WALLET' | 'BANK' | 'CREDIT_CARD'

export interface Account {
    name: string
    balance: Amount
    imageUrl?: string
    user: User
    type: AccountType
}