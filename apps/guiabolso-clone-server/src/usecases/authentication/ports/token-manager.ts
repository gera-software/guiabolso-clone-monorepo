import { Either } from "@/shared"

export type Payload = {
    data?: {
        id?: string,
        name?: string,
        email?: string,
    }
    exp?: number,
    iat?: number,
    

    // deprecated
    id?: string,
    name?: string,
    email?: string,
    
}

export interface TokenManager {
    sign(info: Payload, expiresIn?: string): Promise<string>
    verify(token: string): Promise<Either<Error, Payload>>
}