import { InstitutionData } from "./institution-data";

export interface BankAccountData {
    type: string,
    name: string,
    balance: number,
    imageUrl?: string,
    userId: string,
    institution?: InstitutionData,
    id?: string,
}