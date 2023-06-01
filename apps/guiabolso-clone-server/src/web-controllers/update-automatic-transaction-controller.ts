import { TransactionRequest, UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, ok, serverError } from "./util";
import { MissingParamError } from "./errors";

export class UpdateAutomaticTransactionController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }
    
    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['id']
            
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }

            const transactionRequest: TransactionRequest = request.body
            const response = await this.usecase.perform(transactionRequest)

            if(response.isLeft()) {
                return badRequest(response.value)
            }

            return ok(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

}