export class InvalidPasswordError extends Error {
    public readonly name = "InvalidPasswordError"

    constructor(message?: string) {
    	super(message)
    }
    
}