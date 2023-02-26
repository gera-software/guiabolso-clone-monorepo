export class MissingParamError extends Error {
    public readonly name = "MissingParamError"

    constructor(message?: string) {
    	super(message)
    }
    
}