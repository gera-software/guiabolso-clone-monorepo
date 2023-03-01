import { InstitutionData } from "@/usecases/ports"

export interface AccountData {
    name: string
    balance: number
    imageUrl?: string
    userId: string
    institution?: InstitutionData
    id?: string
}