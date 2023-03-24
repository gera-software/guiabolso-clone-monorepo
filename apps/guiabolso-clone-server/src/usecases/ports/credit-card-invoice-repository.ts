import { CreditCardInvoiceData } from "@/usecases/ports"

export interface CreditCardInvoiceRepository {
    add(invoice: CreditCardInvoiceData): Promise<CreditCardInvoiceData>
    findById(id: string): Promise<CreditCardInvoiceData>
    findByDueDate(date: Date): Promise<CreditCardInvoiceData>
    exists(id: string): Promise<boolean>
    updateAmount(id: string, amount: number): Promise<void>
}