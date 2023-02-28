export class UnregisteredUserError extends Error {
    public readonly name = "UnregisteredUserError"

    constructor(message?: string) {
    	super(message)
    }
    
}