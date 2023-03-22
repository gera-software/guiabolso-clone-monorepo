import { CreditCardInvoiceData } from "@/usecases/ports"

export interface CreditCardInvoiceRepository {
    add(invoice: CreditCardInvoiceData): Promise<CreditCardInvoiceData>
    findById(id: string): Promise<CreditCardInvoiceData>
    exists(id: string): Promise<boolean>
}