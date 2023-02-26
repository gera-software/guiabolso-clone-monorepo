import { Encoder } from "@/usecases/ports"
import { SignUp } from "@/usecases/sign-up"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { RegisterUserController } from '@/web-controllers/register-user-controller'
import { AuthenticationServiceStub } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"

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
        // expect(response.body).toEqual(request.body)
    })
})