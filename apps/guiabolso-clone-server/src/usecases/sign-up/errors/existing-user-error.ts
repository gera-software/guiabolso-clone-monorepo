export class ExistingUserError extends Error {
    public readonly name = "ExistingUserError"

    constructor(message?: string) {
    	super(message)
    }
    
}