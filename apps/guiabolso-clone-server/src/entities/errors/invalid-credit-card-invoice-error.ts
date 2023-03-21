export class InvalidCreditCardInvoiceError extends Error {
    public readonly name = "InvalidCreditCardInvoiceError"

    constructor(message?: string) {
    	super(message)
    }
    
}