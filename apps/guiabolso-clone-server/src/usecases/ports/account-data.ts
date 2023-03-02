import { CreditCardInfoData, InstitutionData } from "@/usecases/ports"

export interface AccountData {
    id?: string,
    type: string,
    name: string
    balance: number
    imageUrl?: string
    userId: string
    institution?: InstitutionData
    creditCardInfo?: CreditCardInfoData,
}