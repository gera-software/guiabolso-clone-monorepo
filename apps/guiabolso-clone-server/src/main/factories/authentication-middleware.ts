import { Authentication } from "@/web-controllers/middlewares"
import { Middleware } from "@/web-controllers/middlewares/ports"
import { makeTokenManager } from "@/main/factories"

export const makeAuthMiddleware = (): Middleware => {
    return new Authentication(makeTokenManager())
}