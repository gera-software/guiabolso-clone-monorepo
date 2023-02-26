import { CustomAuthentication } from "@/usecases/authentication"
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors"
import { SignInData } from "@/usecases/authentication/ports"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Custom authentication', () => {

    test('should not authenticate if password is incorrect', async () => {
        const userUserRepository = new InMemoryUserRepository([
            {
                name: 'valid name',
                email: 'valid@email.com',
                password: 'validENCRYPTED',
                id: '6057e9885c94f99b6dc1410a',
            }
        ])

        const invalidSignInRequest: SignInData = {
            email: 'valid@email.com',
            password: 'invalid',
        }
        const authentication = new CustomAuthentication(userUserRepository)
        const response = (await (authentication.auth(invalidSignInRequest))).value as Error
        expect(response).toBeInstanceOf(WrongPasswordError)
    })

    test('should not authenticate if user is not found (email is incorrect)', async () => {
        const userUserRepository = new InMemoryUserRepository([
            {
                name: 'valid name',
                email: 'valid@email.com',
                password: 'validENCRYPTED',
                id: '6057e9885c94f99b6dc1410a',
            }
        ])

        const invalidSignInRequest: SignInData = {
            email: 'invalid@email.com',
            password: 'valid',
        }
        const authentication = new CustomAuthentication(userUserRepository)
        const response = (await (authentication.auth(invalidSignInRequest))).value as Error
        expect(response).toBeInstanceOf(UserNotFoundError)
    })
})