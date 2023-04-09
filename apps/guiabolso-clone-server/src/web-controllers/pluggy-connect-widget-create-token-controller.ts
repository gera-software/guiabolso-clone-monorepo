import { UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { badRequest, created, serverError } from "@/web-controllers/util";

export class PluggyConnectWidgetCreateTokenController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const accessToken = await this.usecase.perform(request.body)
    
            if(accessToken.isLeft()) {
                return badRequest(accessToken.value)
            }
    
            return created({ accessToken: accessToken.value })
        } catch(error) {
            return serverError(error)
        }
    }

}