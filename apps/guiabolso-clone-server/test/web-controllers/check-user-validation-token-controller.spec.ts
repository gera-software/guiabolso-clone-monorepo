import { CheckUserValidationToken } from "@/usecases/check-user-validation-token"
import { UseCase } from "@/usecases/ports"
import { EmailValidationPayloadData } from "@/usecases/send-user-validation-token/ports"
import { CheckUserValidationTokenController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Check user validatin token web controller', () => {
    test('should return status code 200 ok when token is validated', async () => {
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
        const usecase = new CheckUserValidationToken(userRepository, fakeTokenManager)
        const sut = new CheckUserValidationTokenController(usecase) 

        const payload: EmailValidationPayloadData = {
            id: userId,
            email: 'valid@email.com',
        }
        const sixHours = 60 * 60 * 6
        const emailValidationToken = await fakeTokenManager.sign(payload, sixHours)

        const request: HttpRequest = {
            body: {
            },
            query: {
                t: emailValidationToken
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(200)
    })

    test('should return status code 400 when request is missing token', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const usecase = new CheckUserValidationToken(userRepository, fakeTokenManager)
        const sut = new CheckUserValidationTokenController(usecase) 

        const request: HttpRequest = {
            body: {
            },
            query: {
                
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect((response.body as Error).message).toEqual('Missing parameters from request: t.')
    })

    test('should return status code 400 when token is invalid', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const usecase = new CheckUserValidationToken(userRepository, fakeTokenManager)
        const sut = new CheckUserValidationTokenController(usecase) 

        const request: HttpRequest = {
            body: {
            },
            query: {
                t: 'invalid-token'
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('InvalidTokenError')
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new CheckUserValidationTokenController(errorThrowingUseCaseStub) 

        const request: HttpRequest = {
            body: {
            },
            query: {
                t: 'valid-token'
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(500)
    })
})