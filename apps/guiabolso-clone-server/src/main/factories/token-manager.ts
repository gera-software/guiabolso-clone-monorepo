import { JwtTokenManager } from "@/external/token-manager"
import { TokenManager } from "@/usecases/ports"

export const makeTokenManager = (): TokenManager => {
    return new JwtTokenManager(process.env.JWT_SECRET ?? '')
}