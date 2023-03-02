export class InvalidCreditCardError extends Error {
    public readonly name = "InvalidCreditCardError"

    constructor(message?: string) {
    	super(message)
    }
    
}