import { ResetPassword } from "@/usecases/reset-password"
import { ResetPasswordPayloadData } from "@/usecases/send-password-reset-token/ports"
import { ResetPasswordController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { FakeMailService } from "@test/doubles/mail"
import { InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Reset password web controller', () => {
    test('should return status code 400 when request is missing params', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const fakeEncoder = new FakeEncoder()
        const usecase = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, fakeEncoder, process.env.FRONTEND_URL)
        const sut = new ResetPasswordController(usecase) 

        const request: HttpRequest = {
            body: {
            },
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect((response.body as Error).message).toEqual('Missing parameters from request: token, password.')
    })

    test('should return status code 400 when token is invalid', async () => {
        const token = 'invalid-token'

        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const fakeEncoder = new FakeEncoder()
        const usecase = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, fakeEncoder, process.env.FRONTEND_URL)
        const sut = new ResetPasswordController(usecase) 

        const request: HttpRequest = {
            body: {
                token,
                password: 'valid',
            },
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('InvalidTokenError')
        expect((response.body as Error).message).toEqual('Invalid token.')
    })

    test('should return status code 400 when user does not exists', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const fakeEncoder = new FakeEncoder()
        const usecase = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, fakeEncoder, process.env.FRONTEND_URL)
        const sut = new ResetPasswordController(usecase) 

        const payload: ResetPasswordPayloadData = {
            id: 'invalid-user',
            email: 'valid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request: HttpRequest = {
            body: {
                token: resetPasswordToken,
                password: 'valid',
            },
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('InvalidTokenError')
        expect((response.body as Error).message).toEqual('usuário inválido')
    })

    test('should return status code 400 when email does not match', async () => {
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
        const fakeEncoder = new FakeEncoder()
        const usecase = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, fakeEncoder, process.env.FRONTEND_URL)
        const sut = new ResetPasswordController(usecase) 

        const payload: ResetPasswordPayloadData = {
            id: userId,
            email: 'invalid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request: HttpRequest = {
            body: {
                token: resetPasswordToken,
                password: 'valid',
            },
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('InvalidTokenError')
        expect((response.body as Error).message).toEqual('email inválido')
    })

    test('should return status code 204 success no content when password is updated', async () => {
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
        const fakeEncoder = new FakeEncoder()
        const usecase = new ResetPassword(userRepository, fakeTokenManager, fakeMailService, fakeEncoder, process.env.FRONTEND_URL)
        const sut = new ResetPasswordController(usecase) 

        const payload: ResetPasswordPayloadData = {
            id: userId,
            email: userData.email,
        }
        const sixHours = 60 * 60 * 6
        const resetPasswordToken = await fakeTokenManager.sign(payload, sixHours)

        const request: HttpRequest = {
            body: {
                token: resetPasswordToken,
                password: 'new-password',
            },
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(204)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub = new ErrorThrowingUseCaseStub()
        const sut = new ResetPasswordController(errorThrowingUseCaseStub) 

        const request: HttpRequest = {
            body: {
                token: 'valid-token',
                password: 'valid',
            },
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(500)
    })

})