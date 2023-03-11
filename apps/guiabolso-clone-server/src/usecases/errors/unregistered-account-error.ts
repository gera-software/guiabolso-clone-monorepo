export class UnregisteredAccountError extends Error {
    public readonly name = "UnregisteredAccountError"

    constructor(message?: string) {
    	super(message)
    }
    
}