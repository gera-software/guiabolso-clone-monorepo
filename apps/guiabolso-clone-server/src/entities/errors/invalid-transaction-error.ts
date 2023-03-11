export class InvalidTransactionError extends Error {
    public readonly name = "InvalidTransactionError"

    constructor(message?: string) {
    	super(message)
    }
    
}