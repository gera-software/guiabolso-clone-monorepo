import { CustomAuthentication } from "@/usecases/authentication"
import { AuthenticationResult } from "@/usecases/authentication/ports"
import { UseCase, UserData } from "@/usecases/ports"
import { SignIn } from "@/usecases/sign-in"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { SignInController } from "@/web-controllers/sign-in-controller"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Sign In web controller', () => {
    test('should return 200 if valid credentials are provided', async () => {
        const validUser: UserData = {
            id: 'valid_id',
            name: 'Any name',
            email: 'any@email.com',
            password: 'validENCRYPTED'
        }
        const userRepository = new InMemoryUserRepository([validUser])
        const usecase = new SignIn(new CustomAuthentication(userRepository, new FakeEncoder(), new FakeTokenManager()))
        const sut: SignInController = new SignInController(usecase) 

        const validRequest: HttpRequest = {
            body: {
              email: 'any@email.com',
              password: 'valid'
            }
        }
        const response: HttpResponse = await sut.handle(validRequest)
        const authResult = response.body as AuthenticationResult
        expect(response.statusCode).toEqual(200)
        expect(authResult.data).toEqual({
            id: "valid_id",
            email: "fake@mail.com",
            name: "fake name",
        })
        expect(authResult.accessToken).toBeTruthy()
        expect(authResult.iat).toBeDefined()
        expect(authResult.exp).toBeDefined()
    })

    test('should return 400 if password and email are missing in the request', async () => {
        const userRepository = new InMemoryUserRepository([])
        const usecase = new SignIn(new CustomAuthentication(userRepository, new FakeEncoder(), new FakeTokenManager()))
        const sut: SignInController = new SignInController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('MissingParamError')
        expect((response.body as Error).message).toEqual('Missing parameters from request: email, password.')
    })

    test('should return 403 if password is incorrect', async () => {
        const validUser: UserData = {
            id: 'valid_id',
            name: 'Any name',
            email: 'any@email.com',
            password: 'validENCRYPTED'
        }
        const userRepository = new InMemoryUserRepository([validUser])
        const usecase = new SignIn(new CustomAuthentication(userRepository, new FakeEncoder(), new FakeTokenManager()))
        const sut: SignInController = new SignInController(usecase) 

        const invalidRequest: HttpRequest = {
            body: {
                email: 'any@email.com',
                password: 'invalid'
              }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(403)
        expect(response.body.name).toBe('WrongPasswordError')
        expect(response.body.message).toBe('E-mail ou senha incorretos')
    })

    test('should return 400 if user is not found', async () => {
        const userRepository = new InMemoryUserRepository([])
        const usecase = new SignIn(new CustomAuthentication(userRepository, new FakeEncoder(), new FakeTokenManager()))
        const sut: SignInController = new SignInController(usecase) 

        const validRequest: HttpRequest = {
            body: {
              email: 'any@email.com',
              password: 'valid'
            }
        }
        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(400)
        
        expect(response.body.name).toBe('UserNotFoundError')
        expect(response.body.message).toBe('E-mail ou senha incorretos')

    })

    test('should return 500 if an error is raised internally', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()

        const sut: SignInController = new SignInController(errorThrowingUseCaseStub) 

        const validRequest: HttpRequest = {
            body: {
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
        expect(response.body.name).toBe('ServerError')
        expect(response.body.message).toBe("Error: Error Throwing Use Case Stub")
    })
})