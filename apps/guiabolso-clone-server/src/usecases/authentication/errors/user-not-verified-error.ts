export class UserNotVerifiedError extends Error {
    public readonly name = "UserNotVerifiedError"

    constructor(message?: string) {
    	super(message)
    }
    
}