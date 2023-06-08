import { UseCase, UserData } from "@/usecases/ports"
import { SendPasswordResetToken } from "@/usecases/send-password-reset-token"
import { SendPasswordResetTokenController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeMailService } from "@test/doubles/mail"
import { InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Send reset password token web controller', () => {
    test('should return status code 400 bad request when email is not provided', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const usecase = new SendPasswordResetToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const sut = new SendPasswordResetTokenController(usecase) 

        const request: HttpRequest = {
            body: {
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')

    })

    test('should return status code 204 success no content when user if found', async () => {
        const validUser: UserData = {
            id: 'valid_id',
            name: 'Any name',
            email: 'valid@email.com',
            isVerified: true,
            password: 'validENCRYPTED'
        }

        const userRepository = new InMemoryUserRepository([validUser])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const usecase = new SendPasswordResetToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const sut = new SendPasswordResetTokenController(usecase) 

        const request: HttpRequest = {
            body: {
              email: 'valid@email.com',
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(204)
    })

    test('should return status code 204 success no content even if user is not found', async () => {
        const userRepository = new InMemoryUserRepository([])
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const usecase = new SendPasswordResetToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const sut = new SendPasswordResetTokenController(usecase) 

        const request: HttpRequest = {
            body: {
              email: 'any@email.com',
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(204)
    })

    
    test('should return 500 if an error is raised internally', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()

        const sut = new SendPasswordResetTokenController(errorThrowingUseCaseStub) 

        const validRequest: HttpRequest = {
            body: {
                email: 'any@email.com',
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
        expect(response.body.name).toBe('ServerError')
        expect(response.body.message).toBe("Error: Error Throwing Use Case Stub")
    })
})