import { CheckUserValidationToken } from "@/usecases/check-user-validation-token"
import { InvalidTokenError } from "@/usecases/errors"
import { EmailValidationPayloadData } from "@/usecases/send-user-validation-token/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Check user validation token use case', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should not validate user if token is invalid', async () => {
        const token = 'invalid-token'

        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const sut = new CheckUserValidationToken(userRepository, fakeTokenManager)

        const response = (await sut.perform(token)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('Invalid token.')
    })

    test('should not validate user if user does not exists', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const sut = new CheckUserValidationToken(userRepository, fakeTokenManager)

        const payload: EmailValidationPayloadData = {
            id: 'invalid-user-id',
            email: 'valid-email',
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await fakeTokenManager.sign(payload, sixHours)

        const response = (await sut.perform(emailValidationToken)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('usuário inválido')

    })

    test('should not validate if user already is validated', async () => {
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
        const sut = new CheckUserValidationToken(userRepository, fakeTokenManager)

        const payload: EmailValidationPayloadData = {
            id: userId,
            email: 'valid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await fakeTokenManager.sign(payload, sixHours)

        const response = (await sut.perform(emailValidationToken)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('Usuário já está validado')
    })

    test('should not validate user if email does not match', async () => {
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
        const sut = new CheckUserValidationToken(userRepository, fakeTokenManager)

        const payload: EmailValidationPayloadData = {
            id: userId,
            email: 'invalid-email',
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await fakeTokenManager.sign(payload, sixHours)

        const response = (await sut.perform(emailValidationToken)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('email inválido')
    })

    test('should validate user', async () => {
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
        const sut = new CheckUserValidationToken(userRepository, fakeTokenManager)

        const payload: EmailValidationPayloadData = {
            id: userId,
            email: 'valid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await fakeTokenManager.sign(payload, sixHours)

        await sut.perform(emailValidationToken)

        const validatedUser = await userRepository.findUserById(userId)
        expect(validatedUser.isVerified).toBe(true)
    })
    
})