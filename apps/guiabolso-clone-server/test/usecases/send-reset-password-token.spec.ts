import { SendResetPasswordToken } from "@/usecases/send-reset-password-token"
import { ResetPasswordPayloadData } from "@/usecases/send-reset-password-token/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeMailService } from "@test/doubles/mail"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Send reset password token use case', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should not send a token if user with that email does not exists', async () => {
        const email = 'invalid-email'

        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sut = new SendResetPasswordToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)

        await sut.perform(email)
        expect(fakeMailService._sended.length).toEqual(0)
    })

    test('should send a token if user exists', async () => {
        const userId = 'valid-user-id'
        const email = 'valid-email@email.com'

        const userData = {
            name: 'valid name',
            email: email,
            password: 'validENCRYPTED',
            isVerified: false,
            id: userId,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sut = new SendResetPasswordToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)

        await sut.perform(email)

        const payload: ResetPasswordPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)
        const url = `${process.env.FRONTEND_URL}/reset-password?t=${resetPasswordToken}`
        expect(fakeMailService._sended[0]).toEqual({
            textMessage: `Olá ${userData.name},\nAcesse o link para resetar sua senha: ${url}`, 
            htmlMessage: `
            <p>Olá ${userData.name},</p>
            <p>Acesse o link para resetar sua senha: <a href="${url}">Resetar senha</a></p>`,
            subject: "[Guiabolso Clone] Solicitação de alteração de senha", 
            to: userData.email
        })
    })

    test('should send a token with expiration in 6 hours', async () => {
        const userId = 'valid-user-id'
        const email = 'valid-email@email.com'

        const userData = {
            name: 'valid name',
            email: email,
            password: 'validENCRYPTED',
            isVerified: false,
            id: userId,
        }

        const userRepository = new InMemoryUserRepository([userData])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sut = new SendResetPasswordToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)

        const mockTokenManager = jest.spyOn(fakeTokenManager, 'sign')
        await sut.perform(email)

        const payload: ResetPasswordPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        expect(mockTokenManager).toBeCalledWith(payload, sixHours)

    })
})