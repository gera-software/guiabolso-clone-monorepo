import { InstitutionData } from "./institution-data";

export interface BankAccountData {
    name: string,
    balance: number,
    imageUrl?: string,
    userId: string,
    institution?: InstitutionData,
    id?: string,
}