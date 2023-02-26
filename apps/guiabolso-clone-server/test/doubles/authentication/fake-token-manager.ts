import { Either } from "@/shared";
import { Payload, TokenManager } from "@/usecases/authentication/ports";

export class FakeTokenManager implements TokenManager {

    async sign(info: Payload, expiresIn?: string | undefined): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async verify(token: string): Promise<Either<Error, Payload>> {
        throw new Error("Method not implemented.");
    }

}