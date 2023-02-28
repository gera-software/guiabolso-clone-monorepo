export class InvalidBalanceError extends Error {
    public readonly name = "InvalidBalanceError"

    constructor(message?: string) {
    	super(message)
    }
    
}