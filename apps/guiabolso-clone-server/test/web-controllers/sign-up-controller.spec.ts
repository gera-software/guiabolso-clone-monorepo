import { Encoder, UseCase } from "@/usecases/ports"
import { SignUp } from "@/usecases/sign-up"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { SignUpController } from '@/web-controllers/sign-up-controller'
import { AuthenticationServiceStub } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Sign Up web controller', () => {
    test('should return status code 201 created when request contains valid user data', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUpController = new SignUpController(usecase) 

        const request: HttpRequest = {
            body: {
              name: 'Any name',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(201)
        expect(response.body.id).toBeTruthy()
        expect(response.body.accessToken).toBeTruthy()
    })

    test('should return status code 400 when request contains invalid name', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUpController = new SignUpController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              name: '',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
    })




    test('should return status code 400 when request contains invalid email', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUpController = new SignUpController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              name: 'valid name',
              email: 'invalid_email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('InvalidEmailError')
    })

    test('should return status code 400 when request contains invalid password', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUpController = new SignUpController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              name: 'valid name',
              email: 'valid@email.com',
              password: ''
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
    })



    test('should return status code 400 when request is missing name', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUpController = new SignUpController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect((response.body as Error).message).toEqual('Missing parameters from request: name.')
    })

    test('should return status code 400 when request is missing email or password', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUpController = new SignUpController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
                name: 'any name'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect((response.body as Error).message).toEqual('Missing parameters from request: email, password.')
    })




    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut: SignUpController = new SignUpController(errorThrowingUseCaseStub) 

        const request: HttpRequest = {
            body: {
              name: 'Any name',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(500)
        expect(response.body.name).toBe('ServerError')
        expect(response.body.message).toBe("Error: Error Throwing Use Case Stub")
    })
})