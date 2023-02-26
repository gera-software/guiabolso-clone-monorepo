export class WrongPasswordError extends Error {
    public readonly name = "WrongPasswordError"

    constructor(message?: string) {
    	super(message)
    }
    
}