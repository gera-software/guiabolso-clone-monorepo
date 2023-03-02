import { CustomAuthentication } from "@/usecases/authentication"
import { UserNotFoundError, WrongPasswordError } from "@/usecases/authentication/errors"
import { AuthenticationResult } from "@/usecases/authentication/ports"
import { SignIn } from "@/usecases/sign-in"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Sign in use case', () => {

    test('should correctly sign in if email and password are correct', async () => {
        const singInRequest = {
            email: 'valid@email.com',
            password: 'valid',
        }

        const validUser = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            id: '6057e9885c94f99b6dc1410a',
        }
        const userRepository = new InMemoryUserRepository([validUser])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager)
        const sut = new SignIn(autenticationService)
        const userResponse = (await sut.perform(singInRequest)).value as AuthenticationResult
        expect(userResponse.id).toEqual(validUser.id)
        expect(userResponse.accessToken).toBeTruthy()

    })

    test('should not sign in if password is incorrect', async () => {
        const singInRequest = {
            email: 'valid@email.com',
            password: 'invalid',
        }

        const user = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            id: '6057e9885c94f99b6dc1410a',
        }
        const userRepository = new InMemoryUserRepository([user])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager)
        const sut = new SignIn(autenticationService)
        const response = (await sut.perform(singInRequest)).value as Error
        expect(response).toBeInstanceOf(WrongPasswordError)
    })

    test('should not sign in with unregistered user', async () => {
        const singInRequest = {
            email: 'invalid@email.com',
            password: 'valid',
        }

        const user = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            id: '6057e9885c94f99b6dc1410a',
        }
        const userRepository = new InMemoryUserRepository([user])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager)
        const sut = new SignIn(autenticationService)
        const response = (await sut.perform(singInRequest)).value as Error
        expect(response).toBeInstanceOf(UserNotFoundError)
    })
})