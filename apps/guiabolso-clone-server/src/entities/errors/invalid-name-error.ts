export class InvalidNameError extends Error {
    public readonly name = "InvalidNameError"

    constructor(message?: string) {
    	super(message)
    }
    
}