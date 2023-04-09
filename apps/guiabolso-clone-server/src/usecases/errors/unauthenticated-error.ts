export class UnauthenticatedError extends Error {
    public readonly name = "UnauthenticatedError"

    constructor(message?: string) {
    	super(message)
    }
    
}