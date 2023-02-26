import { UseCase } from "@/usecases/ports";
import { Controller, HttpRequest, HttpResponse } from "@/web-controllers/ports";
import { ok } from "@/web-controllers/util";

export class RegisterUserController implements Controller {
    private readonly usecase: UseCase

    constructor(usecase: UseCase) {
        this.usecase = usecase
    }

    public async handle(request: HttpRequest): Promise<HttpResponse> {
        return ok(request)
    }

}