import { Amount, User } from "@/entities"

export interface Account {
    name: string
    balance: Amount
    imageUrl?: string
    user: User
}