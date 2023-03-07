export class InvalidIconNameError extends Error {
    public readonly name = "InvalidIconNameError"

    constructor(message?: string) {
    	super(message)
    }
    
}