import { AuthenticationResult, Payload } from "@/usecases/authentication/ports";
import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"
import { FakeTokenManager } from "@test/doubles/authentication";
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Send user validation token use case', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should not send a token if user does not exists', async () => {
        const userId = 'invalid-user-id'

        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager)

        const response = (await sut.perform(userId)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not send a token if user already is verified', async () => {
        const userId = 'valid-user-id'

        const userData = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            isVerified: true,
            id: userId,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const fakeTokenManager = new FakeTokenManager()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager)

        const response = (await sut.perform(userId)).value as Error
        expect(response).toBeInstanceOf(InvalidUserError)
        expect(response.message).toBe('Usuário já verificado')
    })

    test('should generate a token if user is not verified', async () => {
        const userId = 'valid-user-id'

        const userData = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            isVerified: false,
            id: userId,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const fakeTokenManager = new FakeTokenManager()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager)

        const response = (await sut.perform(userId)).value as AuthenticationResult
        const verification = (await fakeTokenManager.verify(response.accessToken)).value as Payload
        expect(response.data).toEqual(verification.data)
        expect(response.exp).toEqual(verification.exp)
        expect(response.iat).toEqual(verification.iat)

    })
})