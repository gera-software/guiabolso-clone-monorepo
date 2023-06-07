import { CustomAuthentication } from "@/usecases/authentication"
import { UserNotFoundError, UserNotVerifiedError, WrongPasswordError } from "@/usecases/authentication/errors"
import { AuthenticationResult, AuthenticationParams } from "@/usecases/authentication/ports"
import { Encoder, Payload } from "@/usecases/ports"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { FakeMailService } from "@test/doubles/mail"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Custom authentication', () => {

    test('should correctly authenticate if user email and password is correct', async () => {
        const userRepository = new InMemoryUserRepository([
            {
                name: 'valid name',
                email: 'valid@email.com',
                password: 'validENCRYPTED',
                isVerified: true,
                id: '6057e9885c94f99b6dc1410a',
            }
        ])

        const validSignInRequest: AuthenticationParams = {
            email: 'valid@email.com',
            password: 'valid',
        }

        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const authentication = new CustomAuthentication(userRepository, encoder, fakeTokenManager, sendUserValidationTokenUsecase)
        const result = (await authentication.auth(validSignInRequest)).value as AuthenticationResult

        expect(result.accessToken).toBeDefined()
        const verification = (await fakeTokenManager.verify(result.accessToken)).value as Payload
        expect(result.data).toEqual(verification.data)
        expect(result.exp).toEqual(verification.exp)
        expect(result.iat).toEqual(verification.iat)

    })

    test('should not authenticate if password is correct but user is not verified', async () => {
        const userRepository = new InMemoryUserRepository([
            {
                name: 'valid name',
                email: 'valid@email.com',
                password: 'validENCRYPTED',
                isVerified: false,
                id: '6057e9885c94f99b6dc1410a',
            }
        ])

        const validSignInRequest: AuthenticationParams = {
            email: 'valid@email.com',
            password: 'valid',
        }
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const authentication = new CustomAuthentication(userRepository, encoder, fakeTokenManager, sendUserValidationTokenUsecase)
        const response = (await (authentication.auth(validSignInRequest))).value as Error
        expect(response).toBeInstanceOf(UserNotVerifiedError)
    })

    test('should not authenticate if password is incorrect', async () => {
        const userRepository = new InMemoryUserRepository([
            {
                name: 'valid name',
                email: 'valid@email.com',
                password: 'validENCRYPTED',
                isVerified: true,
                id: '6057e9885c94f99b6dc1410a',
            }
        ])

        const invalidSignInRequest: AuthenticationParams = {
            email: 'valid@email.com',
            password: 'invalid',
        }
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const authentication = new CustomAuthentication(userRepository, encoder, fakeTokenManager, sendUserValidationTokenUsecase)
        const response = (await (authentication.auth(invalidSignInRequest))).value as Error
        expect(response).toBeInstanceOf(WrongPasswordError)
    })

    test('should not authenticate if user is not found (email is incorrect)', async () => {
        const userRepository = new InMemoryUserRepository([])

        const invalidSignInRequest: AuthenticationParams = {
            email: 'invalid@email.com',
            password: 'valid',
        }
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const authentication = new CustomAuthentication(userRepository, encoder, fakeTokenManager, sendUserValidationTokenUsecase)
        const response = (await (authentication.auth(invalidSignInRequest))).value as Error
        expect(response).toBeInstanceOf(UserNotFoundError)
    })
})