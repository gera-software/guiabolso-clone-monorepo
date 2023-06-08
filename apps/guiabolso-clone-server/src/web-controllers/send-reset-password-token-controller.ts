import { UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, noContent, serverError } from "@/web-controllers/util";
import { MissingParamError } from "@/web-controllers/errors";

export class SendResetPasswordTokenController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['email']
    
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }
    
            const response = await this.usecase.perform(request.body.email)
    
            if(response.isLeft()) {
                return badRequest(response.value)
            }
    
            return noContent(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

}