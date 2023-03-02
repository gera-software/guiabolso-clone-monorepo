import { InstitutionData } from "@/usecases/ports";

export interface BankAccountData {
    type: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: string,
    institution?: InstitutionData,
    id?: string,
}