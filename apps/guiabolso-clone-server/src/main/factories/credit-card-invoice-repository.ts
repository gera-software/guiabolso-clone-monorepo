import { CreditCardInvoiceRepository } from "@/usecases/ports"

export const makeCreditCardInvoiceRepository = (): CreditCardInvoiceRepository => {
    return new MongodbCreditCardInvoiceRepository()
}