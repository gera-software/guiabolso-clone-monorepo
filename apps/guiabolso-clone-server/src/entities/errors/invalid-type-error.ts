export class InvalidTypeError extends Error {
    public readonly name = "InvalidTypeError"

    constructor(message?: string) {
    	super(message)
    }
    
}