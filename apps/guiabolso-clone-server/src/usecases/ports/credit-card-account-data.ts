import { CreditCardInfoData, InstitutionData } from "@/usecases/ports";

export interface CreditCardAccountData {
    type: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: string,
    institution?: InstitutionData,
    id?: string,
    creditCardInfo: CreditCardInfoData,
}