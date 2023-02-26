export class UserNotFoundError extends Error {
    public readonly name = "UserNotFoundError"

    constructor(message?: string) {
    	super(message)
    }
    
}