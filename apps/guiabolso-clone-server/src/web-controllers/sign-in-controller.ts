import { UseCase, UserData } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, forbidden, ok, serverError } from "@/web-controllers/util";
import { MissingParamError } from "@/web-controllers/errors";
import { UserNotVerifiedError, WrongPasswordError } from "@/usecases/authentication/errors";

/**
 * Autenticação de usuário
 */
export class SignInController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    public async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['email', 'password']
    
            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })
    
            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }
    
            const userData: UserData = request.body
            const response = await this.usecase.perform(userData)
    
            if(response.isRight()) {
                return ok(response.value)
            }
            
            if(response.value instanceof WrongPasswordError || response.value instanceof UserNotVerifiedError) {
                return forbidden(response.value)
            }
    
            return badRequest(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

}