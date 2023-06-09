import { InvalidPasswordError } from "@/entities/errors"
import { InvalidTokenError } from "@/usecases/errors"
import { ResetPassword } from "@/usecases/reset-password"
import { ResetPasswordPayloadData } from "@/usecases/send-password-reset-token/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { FakeMailService } from "@test/doubles/mail"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Reset password use case', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should not permit reset if token is invalid', async () => {
        const token = 'invalid-token'
        const request = {
            token,
            password: 'valid',
        }

        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const encoder = new FakeEncoder()
        const sut = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, encoder, process.env.FRONTEND_URL)

        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('Invalid token.')
    })

    test('should not reset if user does not exists', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const encoder = new FakeEncoder()
        const sut = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, encoder, process.env.FRONTEND_URL)

        const payload: ResetPasswordPayloadData = {
            id: 'invalid-user',
            email: 'valid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request = {
            token: resetPasswordToken,
            password: 'valid',
        }

        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('usuário inválido')
    })

    test('should not reset if email does not match', async () => {
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
        const fakeMailService = new FakeMailService()
        const encoder = new FakeEncoder()
        const sut = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, encoder, process.env.FRONTEND_URL)

        const payload: ResetPasswordPayloadData = {
            id: userId,
            email: 'invalid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request = {
            token: resetPasswordToken,
            password: 'valid',
        }

        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidTokenError)
        expect(response.message).toBe('email inválido')
    })

    test('should not reset if password is invalid', async () => {
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
        const fakeMailService = new FakeMailService()
        const encoder = new FakeEncoder()
        const sut = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, encoder, process.env.FRONTEND_URL)

        const payload: ResetPasswordPayloadData = {
            id: userId,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request = {
            token: resetPasswordToken,
            password: '',
        }

        const response = (await sut.perform(request)).value as Error
        expect(response).toBeInstanceOf(InvalidPasswordError)
        expect(response.message).toBe("Password can't be empty")
    })

    test('should reset if password is valid', async () => {
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
        const fakeMailService = new FakeMailService()
        const encoder = new FakeEncoder()
        const sut = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, encoder, process.env.FRONTEND_URL)

        const payload: ResetPasswordPayloadData = {
            id: userId,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request = {
            token: resetPasswordToken,
            password: 'new-password',
        }

        await sut.perform(request)

        const updatedUser = await userRepository.findUserById(userId)
        expect(updatedUser.password).toBe('new-passwordENCRYPTED')

        const url = `${process.env.FRONTEND_URL}`

        const sendedEmail = fakeMailService._sended[0]
        expect(sendedEmail.subject).toBe('[Guiabolso Clone] Senha alterada')
        expect(sendedEmail.to).toBe(userData.email)
        expect(sendedEmail.htmlMessage).toBe(`
        <p>Olá ${userData.name},</p>
        <p>Sua senha foi alterada.</p> 
        <p><a href="${url}">Faça login</a></p>`)
    })
})