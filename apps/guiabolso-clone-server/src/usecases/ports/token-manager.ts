import { Either } from "@/shared"

export type TimeInSeconds = number
export type JsonWebToken = string

export type Payload = {
    data: any,
    exp: TimeInSeconds,
    iat: TimeInSeconds,
}


export interface TokenManager {
    sign(info: any, expiresIn?: TimeInSeconds): Promise<JsonWebToken>
    verify(token: JsonWebToken): Promise<Either<Error, Payload>>
}