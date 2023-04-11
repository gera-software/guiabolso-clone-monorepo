export class InvalidAccountError extends Error {
    public readonly name = "InvalidAccountError"

    constructor(message?: string) {
    	super(message)
    }
    
}