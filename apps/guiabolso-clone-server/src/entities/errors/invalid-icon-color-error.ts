export class InvalidIconColorError extends Error {
    public readonly name = "InvalidIconColorError"

    constructor(message?: string) {
    	super(message)
    }
    
}