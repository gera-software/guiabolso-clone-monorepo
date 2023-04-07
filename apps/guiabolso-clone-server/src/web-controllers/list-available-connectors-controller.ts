import { UseCase } from "@/usecases/ports"
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { ok, serverError } from "@/web-controllers/util"

export class ListAvailableConnectorsController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const resultOrError = await this.usecase.perform({})
            if(resultOrError.isLeft()) {
                return serverError(resultOrError.value)
            }

            return ok(resultOrError.value)
        } catch(error) {
            return serverError(error)
        }
    }
}