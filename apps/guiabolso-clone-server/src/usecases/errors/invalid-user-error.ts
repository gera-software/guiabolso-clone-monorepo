export class InvalidUserError extends Error {
    public readonly name = "InvalidUserError"

    constructor(message?: string) {
    	super(message)
    }
    
}