import { UseCase } from "@/usecases/ports";
import { AuthenticationParams, AuthenticationService } from "@/usecases/authentication/ports";

/**
 * Login
 */
export class SignIn implements UseCase {
    private readonly authenticationService: AuthenticationService

    constructor(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService
    }

    async perform(request: AuthenticationParams) {
        return await this.authenticationService.auth(request)
    }

}