export class InvalidTokenError extends Error {
    public readonly name = "InvalidTokenError"

    constructor(message?: string) {
    	super(message)
    }
    
}