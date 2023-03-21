export interface CreditCardInvoiceData {
    id?: string,
    dueDate: Date,
    closeDate: Date,
    amount: number,
    userId: string,
    accountId: string,
    _isDeleted: boolean,
}