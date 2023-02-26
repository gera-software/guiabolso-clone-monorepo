import { Encoder } from "@/usecases/ports"
import { SignUp } from "@/usecases/sign-up"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { RegisterUserController } from '@/web-controllers/register-user-controller'
import { AuthenticationServiceStub } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { MissingParamError } from "@/web-controllers/errors"

describe('Register user web controller', () => {
    test('should return status code ok when request contains valid user data', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: RegisterUserController = new RegisterUserController(usecase) 

        const request: HttpRequest = {
            body: {
              name: 'Any name',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(request)
        expect(response.statusCode).toEqual(200)
        expect(response.body.id).toBeDefined()
        expect(response.body.accessToken).toBeDefined()
    })

    test('should return status code 400 when request contains invalid name', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: RegisterUserController = new RegisterUserController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              name: '',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
    })




    test('should return status code 400 when request contains invalid email', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: RegisterUserController = new RegisterUserController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              name: 'valid name',
              email: 'invalid_email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(InvalidEmailError)
    })

    test('should return status code 400 when request contains invalid password', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: RegisterUserController = new RegisterUserController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              name: 'valid name',
              email: 'valid@email.com',
              password: ''
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
    })



    test('should return status code 400 when request is missing name', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: RegisterUserController = new RegisterUserController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect((response.body as Error).message).toEqual('Missing parameters from request: name.')
    })

    test('should return status code 400 when request is missing email or password', async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const usecase: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
        const sut: RegisterUserController = new RegisterUserController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
                name: 'any name'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect((response.body as Error).message).toEqual('Missing parameters from request: email, password.')
    })
})