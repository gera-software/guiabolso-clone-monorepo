export class UnexpectedError extends Error {
    public readonly name = "UnexpectedError"

    constructor(message?: string) {
    	super(message)
    }
    
}