import { InstitutionData } from "@/usecases/ports"

export interface AccountData {
    type: string,
    name: string
    balance: number
    imageUrl?: string
    userId: string
    institution?: InstitutionData
    id?: string
}