import { CreditCardInvoiceData } from "@/usecases/ports"

export interface CreditCardInvoiceRepository {
    add(invoice: CreditCardInvoiceData): Promise<CreditCardInvoiceData>
    findById(id: string): Promise<CreditCardInvoiceData>
    findByDueDate(date: Date, accountId: string): Promise<CreditCardInvoiceData>
    getLastClosedInvoice(accountId: string): Promise<CreditCardInvoiceData>
    exists(id: string): Promise<boolean>
    updateAmount(id: string, amount: number): Promise<void>
    batchUpdateAmount(data: { invoiceId: string, amount: number }[]): Promise<void>
}