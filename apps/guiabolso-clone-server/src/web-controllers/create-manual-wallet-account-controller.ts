import { AccountData, UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { MissingParamError } from "@/web-controllers/errors";
import { badRequest, created, serverError } from "@/web-controllers/util";

export class CreateManualWalletAccountController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['userId', 'name', 'balance']
        
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }
    
            const accountData: AccountData = request.body
            const response = await this.usecase.perform(accountData)
    
            if(response.isLeft()) {
                return badRequest(response.value)
            }
    
            return created(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

}