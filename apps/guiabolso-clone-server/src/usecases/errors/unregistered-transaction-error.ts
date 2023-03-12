export class UnregisteredTransactionError extends Error {
    public readonly name = "UnregisteredTransactionError"

    constructor(message?: string) {
    	super(message)
    }
    
}