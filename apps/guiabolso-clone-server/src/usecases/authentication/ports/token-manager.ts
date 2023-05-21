import { Either } from "@/shared"

export type PayloadData = {
    id: string,
    name: string,
    email: string,
}

export type TimeInSeconds = number
export type JsonWebToken = string

export type Payload = {
    data: PayloadData,
    exp: TimeInSeconds,
    iat: TimeInSeconds,
}


export interface TokenManager {
    sign(info: PayloadData, expiresIn?: TimeInSeconds): Promise<JsonWebToken>
    verify(token: JsonWebToken): Promise<Either<Error, Payload>>
}