export class InvalidGroupNameError extends Error {
    public readonly name = "InvalidGroupNameError"

    constructor(message?: string) {
    	super(message)
    }
    
}