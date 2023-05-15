import { CreditCardInvoiceStrategy } from "@/entities/credit-card-invoice-strategy";

export class NubankCreditCardInvoiceStrategy implements CreditCardInvoiceStrategy {
    /**
     * Nubank rules (other banks have different rules)
     * All transactions carried out from the invoice closing date onwards will belong to the next month's invoice.
     * All transactions made before the invoice closing date will belong to the current month's invoice.
     * 
     * A fatura do cartão Nubank fecha 7 dias corridos antes do vencimento.
     * Todas as compras feitas a partir do dia de fechamento só entram na fatura seguinte.
     * Por isso, o melhor dia para compra é no dia do fechamento.
     * 
     * @param transactionDate 
     * @param creditCardInfo 
     */
    public calculateInvoiceDatesFromTransaction(transactionDate: Date, creditCardCloseDay: number, creditCardDueDay: number): { invoiceClosingDate: Date; invoiceDueDate: Date; } {
        let year = transactionDate.getUTCFullYear()
        let month = transactionDate.getUTCMonth() // between 0 and 11

        // current invoice
        const invoiceClosingDate = new Date(Date.UTC(year, month, creditCardCloseDay, 0, 0, 0))
        const invoiceDueDate = new Date(Date.UTC(year, month, creditCardDueDay, 0, 0, 0))
        if(invoiceDueDate < invoiceClosingDate) { // ie. the diference between due date and closing date has to be 7 days
            invoiceDueDate.setUTCMonth(invoiceDueDate.getUTCMonth() + 1)
        }

        // next invoice
        if(transactionDate.getUTCDate() >= creditCardCloseDay) {
            invoiceDueDate.setUTCMonth(invoiceDueDate.getUTCMonth() + 1)
            invoiceClosingDate.setUTCMonth(invoiceClosingDate.getUTCMonth() + 1)
        }

        return {
            invoiceClosingDate,
            invoiceDueDate,
        }
    }

}