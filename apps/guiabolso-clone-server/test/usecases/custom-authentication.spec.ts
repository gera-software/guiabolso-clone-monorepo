import { CustomAuthentication } from "@/usecases/authentication"
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors"
import { SignInData } from "@/usecases/authentication/ports"
import { Encoder, UserData } from "@/usecases/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Custom authentication', () => {

    test('should correctly authenticate if user email and password is correct', async () => {
        const userUserRepository = new InMemoryUserRepository([
            {
                name: 'valid name',
                email: 'valid@email.com',
                password: 'validENCRYPTED',
                id: '6057e9885c94f99b6dc1410a',
            }
        ])

        const validSignInRequest: SignInData = {
            email: 'valid@email.com',
            password: 'valid',
        }

        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const authentication = new CustomAuthentication(userUserRepository, encoder, fakeTokenManager)
        const result = (await authentication.auth(validSignInRequest)).value as UserData
        expect(result.id).toBeDefined()

    })

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
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const authentication = new CustomAuthentication(userUserRepository, encoder, fakeTokenManager)
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
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const authentication = new CustomAuthentication(userUserRepository, encoder, fakeTokenManager)
        const response = (await (authentication.auth(invalidSignInRequest))).value as Error
        expect(response).toBeInstanceOf(UserNotFoundError)
    })
})