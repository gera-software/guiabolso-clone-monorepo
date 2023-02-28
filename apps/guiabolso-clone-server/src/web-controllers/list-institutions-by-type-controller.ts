import { UseCase } from "@/usecases/ports";
import { MissingParamError } from "./errors";
import { Controller, HttpRequest, HttpResponse } from "./ports";
import { badRequest, ok, serverError } from "./util";

export class ListInstitutionsByTypeController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['type']
            
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.query[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }
    
            const resultOrError = await this.usecase.perform(request.query.type)
    
            if(resultOrError.isLeft()) {
                return badRequest(resultOrError.value)
            }
    
            return ok(resultOrError.value)
        } catch(error) {
            return serverError(error)
        }
    }
    
}