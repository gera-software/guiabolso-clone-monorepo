import { Payload, TokenManager } from "@/usecases/authentication/ports";
import { Middleware } from "@/web-controllers/middlewares/ports";
import { HttpResponse } from "@/web-controllers/ports";
import { forbidden, ok, serverError } from "@/web-controllers/util";

export class Authentication implements Middleware {
    private readonly tokenManager: TokenManager

    constructor (tokenManager: TokenManager) {
      this.tokenManager = tokenManager
    }

    
    async handle (httpRequest: any): Promise<HttpResponse> {
        try {
            const { accessToken, requesterId } = httpRequest
            if (!accessToken || !requesterId) {
              return forbidden(new Error('Invalid token or requester id.'))
            }
    
            const payloadOrError = await this.tokenManager.verify(accessToken)
    
            if(payloadOrError.isLeft()) {
                return forbidden(new Error('Invalid token.'))
            }
            
            const payload = payloadOrError.value as Payload
            if(payload.id != requesterId) {
                return forbidden(new Error('User not allowed to perform this operation.'))
                
            }
    
            return ok(payload)
        } catch(error) {
            return serverError(error)
        }

    }
}