import { UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, serverError } from "@/web-controllers/util";
import { MissingParamError } from "@/web-controllers/errors";

export class SyncAutomaticAccountController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['accountId']
    
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })

            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }

            const accountId: string = request.body.accountId
            const response = await this.usecase.perform(accountId)
        } catch(error) {
            console.log(error)
            return serverError(error)
        }
    }

}