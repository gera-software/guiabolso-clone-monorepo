export class InvalidEmailError extends Error {
    public readonly name = "InvalidEmailError"

    constructor(message: string) {
    	super(message)
    }
    
}