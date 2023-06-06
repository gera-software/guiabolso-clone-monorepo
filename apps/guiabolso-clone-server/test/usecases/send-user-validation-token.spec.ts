import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"
import { EmailValidationPayloadData } from "@/usecases/send-user-validation-token/ports";
import { FakeTokenManager } from "@test/doubles/authentication";
import { FakeMailService } from "@test/doubles/mail";
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe('Send user validation token use case', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should not send a token if user does not exists', async () => {
        const userId = 'invalid-user-id'

        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService)

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
        const fakeMailService = new FakeMailService()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService)

        const response = (await sut.perform(userId)).value as Error
        expect(response).toBeInstanceOf(InvalidUserError)
        expect(response.message).toBe('Usuário já verificado')
    })

    test('should send a token if user is not verified', async () => {
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
        const fakeMailService = new FakeMailService()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService)

        await sut.perform(userId)

        const payload: EmailValidationPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await fakeTokenManager.sign(payload, sixHours)
        expect(fakeMailService._sended[0]).toEqual({
            message: `Olá ${userData.name},\nConfirme seu e-mail para concluir seu cadastro. Acesse o link: www.site/t=${emailValidationToken}`, 
            subject: "[Guiabolso Clone] Valide seu email", 
            to: userData.email
        })
    })

    test('should send a token with expiration in 6 hours', async () => {
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
        const fakeMailService = new FakeMailService()
        const sut = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService)

        const mockTokenManager = jest.spyOn(fakeTokenManager, 'sign')
        await sut.perform(userId)
        

        const payload: EmailValidationPayloadData = {
            id: userData.id,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        expect(mockTokenManager).toBeCalledWith(payload, sixHours)

    })
})