import { CustomAuthentication } from "@/usecases/authentication"
import { UserNotFoundError, UserNotVerifiedError, WrongPasswordError } from "@/usecases/authentication/errors"
import { AuthenticationResult } from "@/usecases/authentication/ports"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"
import { SignIn } from "@/usecases/sign-in"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { FakeMailService } from "@test/doubles/mail"
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
            isVerified: true,
            id: '6057e9885c94f99b6dc1410a',
        }
        const userRepository = new InMemoryUserRepository([validUser])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, tokenManager, fakeMailService, process.env.FRONTEND_URL)
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager, sendUserValidationTokenUsecase)
        const sut = new SignIn(autenticationService)
        const userResponse = (await sut.perform(singInRequest)).value as AuthenticationResult


        expect(userResponse.data).toEqual({
            id: validUser.id,
            email: 'valid@email.com',
            name: 'valid name',
        })
        expect(userResponse.accessToken).toBeTruthy()
        expect(userResponse.iat).toBeDefined()
        expect(userResponse.exp).toBeDefined()

        // expect(userResponse.id).toEqual(validUser.id)
        // expect(userResponse.accessToken).toBeTruthy()

    })

    test('should not sign in if password is correct but user is not verified', async () => {
        const singInRequest = {
            email: 'valid@email.com',
            password: 'valid',
        }

        const user = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            isVerified: false,
            id: '6057e9885c94f99b6dc1410a',
        }
        const userRepository = new InMemoryUserRepository([user])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, tokenManager, fakeMailService, process.env.FRONTEND_URL)
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager, sendUserValidationTokenUsecase)
        const sut = new SignIn(autenticationService)
        const response = (await sut.perform(singInRequest)).value as Error
        expect(response).toBeInstanceOf(UserNotVerifiedError)
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
            isVerified: true,
            id: '6057e9885c94f99b6dc1410a',
        }
        const userRepository = new InMemoryUserRepository([user])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, tokenManager, fakeMailService, process.env.FRONTEND_URL)
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager, sendUserValidationTokenUsecase)
        const sut = new SignIn(autenticationService)
        const response = (await sut.perform(singInRequest)).value as Error
        expect(response).toBeInstanceOf(WrongPasswordError)
    })

    test('should not sign in with unregistered user', async () => {
        const singInRequest = {
            email: 'invalid@email.com',
            password: 'valid',
        }

        // const user = {
        //     name: 'valid name',
        //     email: 'valid@email.com',
        //     password: 'validENCRYPTED',
        //     isVerified: true,
        //     id: '6057e9885c94f99b6dc1410a',
        // }
        const userRepository = new InMemoryUserRepository([])
        const encoder = new FakeEncoder()
        const tokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, tokenManager, fakeMailService, process.env.FRONTEND_URL)
        const autenticationService = new CustomAuthentication(userRepository, encoder, tokenManager, sendUserValidationTokenUsecase)
        const sut = new SignIn(autenticationService)
        const response = (await sut.perform(singInRequest)).value as Error
        expect(response).toBeInstanceOf(UserNotFoundError)
    })
})