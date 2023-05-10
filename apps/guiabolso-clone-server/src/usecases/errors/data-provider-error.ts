export class DataProviderError extends Error {
    public readonly name = "DataProviderError"

    constructor(message?: string) {
    	super(message)
    }
    
}