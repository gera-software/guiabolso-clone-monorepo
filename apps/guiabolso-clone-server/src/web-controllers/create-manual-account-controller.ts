import { AccountData, UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { MissingParamError } from "@/web-controllers/errors";
import { badRequest, created, serverError } from "@/web-controllers/util";

export class CreateManualAccountController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async createWalletAccount(accountData: AccountData): Promise<HttpResponse> {
        try {
            const response = await this.usecase.perform(accountData)
    
            if(response.isLeft()) {
                return badRequest(response.value)
            }
    
            return created(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

    async createBankAccount(accountData: AccountData): Promise<HttpResponse> {
        try {
            const response = await this.usecase.perform(accountData)
    
            if(response.isLeft()) {
                return badRequest(response.value)
            }
    
            return created(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const requiredParamNames = ['type', 'userId', 'name', 'balance']
        
        const missingParams = requiredParamNames.filter(paramName => {
            return (!request.body[paramName]) ? true : false
        })

        if(missingParams.length > 0) {
            return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
        }

        const accountData: AccountData = request.body

        switch(accountData.type) {
            case 'WALLET':
                return this.createWalletAccount(accountData)
            case 'BANK':
                return this.createBankAccount(accountData)
        }
    }

}