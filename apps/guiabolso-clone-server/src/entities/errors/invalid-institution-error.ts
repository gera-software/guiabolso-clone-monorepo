export class InvalidInstitutionError extends Error {
    public readonly name = "InvalidInstitutionError"

    constructor(message?: string) {
    	super(message)
    }
    
}