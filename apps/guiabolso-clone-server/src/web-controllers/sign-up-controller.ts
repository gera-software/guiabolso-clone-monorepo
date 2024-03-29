import { UseCase, UserData } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, created, ok, serverError } from "@/web-controllers/util";
import { MissingParamError } from "@/web-controllers/errors";

/**
 * Cadastro de usuário
 */
export class SignUpController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    public async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['name', 'email', 'password']

            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })

            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }

            const userData: UserData = request.body

            const response = await this.usecase.perform(userData)

            if(response.isLeft()) {
                return badRequest(response.value)
            }

            return created(response.value)
        } catch(error) {
            return serverError(error)
        }
    }

}