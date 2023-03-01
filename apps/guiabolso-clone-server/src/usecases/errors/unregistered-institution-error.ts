export class UnregisteredInstitutionError extends Error {
    public readonly name = "UnregisteredInstitutionError"

    constructor(message?: string) {
    	super(message)
    }
    
}