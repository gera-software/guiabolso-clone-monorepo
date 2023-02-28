export class InvalidAmountError extends Error {
    public readonly name = "InvalidAmountError"

    constructor(message?: string) {
    	super(message)
    }
    
}