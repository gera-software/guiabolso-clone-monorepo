import { Either } from "@/shared"

export type PayloadRequest = {
    id: string,
    name: string,
    email: string,
}

export type PayloadResponse = {
    data: PayloadRequest,
    exp: number,
    iat: number,
}

export interface TokenManager {
    sign(info: PayloadRequest, expiresIn?: number): Promise<string>
    verify(token: string): Promise<Either<Error, PayloadResponse>>
}