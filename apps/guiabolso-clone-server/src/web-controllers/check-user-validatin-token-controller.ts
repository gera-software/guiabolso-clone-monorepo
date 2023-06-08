import { UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, ok, serverError } from "@/web-controllers/util";
import { MissingParamError } from "@/web-controllers/errors";

export class CheckUserValidationTokenController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['t']
    
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.query[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }
    
            const token = request.query.t
            const result = await this.usecase.perform(token)
    
            if(result.isLeft()) {
                return badRequest(result.value)
            }
    
            return ok(null)
        } catch(error) {
            return serverError(error)
        }
    }

}