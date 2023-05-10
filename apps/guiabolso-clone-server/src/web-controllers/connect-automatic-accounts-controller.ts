import { UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { MissingParamError } from "@/web-controllers/errors";
import { badRequest, created, serverError } from "@/web-controllers/util";
import { DataProviderError } from "@/usecases/errors";

export class ConnectAutomaticAccountsController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['itemId', 'userId']
                
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }
    
            const itemId = request.body.itemId
            const userId = request.body.userId
    
            const response = await this.usecase.perform({ itemId, userId })
            
            if(response.isLeft()) {
                if(response.value instanceof DataProviderError) {
                    throw response.value
                }
                return badRequest(response.value)
            }
    
            return created(response.value)

        } catch(error) {
            return serverError(error)
        }

    }

}