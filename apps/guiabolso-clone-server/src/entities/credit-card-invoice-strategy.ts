export interface CreditCardInvoiceStrategy {
    calculateInvoiceDatesFromTransaction(transactionDate: Date, creditCardCloseDay: number, creditCardDueDay: number): {
        invoiceClosingDate: Date;
        invoiceDueDate: Date;
    }
}