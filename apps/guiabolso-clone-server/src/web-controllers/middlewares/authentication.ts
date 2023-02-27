import { TokenManager } from "@/usecases/authentication/ports";
import { Middleware } from "@/web-controllers/middlewares/ports";
import { HttpResponse } from "@/web-controllers/ports";
import { forbidden } from "../util";

export class Authentication implements Middleware {
    private readonly tokenManager: TokenManager

    constructor (tokenManager: TokenManager) {
      this.tokenManager = tokenManager
    }

    
    async handle (httpRequest: any): Promise<HttpResponse> {
        const { accessToken, requesterId } = httpRequest
        if (!accessToken || !requesterId) {
          return forbidden(new Error('Invalid token or requester id.'))
        }

        return forbidden(new Error('Invalid token.'))
    }
}