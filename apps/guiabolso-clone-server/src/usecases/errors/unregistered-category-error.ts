export class UnregisteredCategoryError extends Error {
    public readonly name = "UnregisteredCategoryError"

    constructor(message?: string) {
    	super(message)
    }
    
}