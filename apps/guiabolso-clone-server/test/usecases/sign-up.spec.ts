import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { AuthenticationResult } from "@/usecases/authentication/ports"
import { Encoder, UserData } from "@/usecases/ports"
import { SignUp } from "@/usecases/sign-up"
import { ExistingUserError } from "@/usecases/sign-up/errors"
import { AuthenticationServiceStub } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe("Sing up use case", () => {
    test("should sign up user with valid data", async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const sut: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)

        const validUserSignUpRequest: UserData = {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }
        const userSignUpResponse = await sut.perform(validUserSignUpRequest)
        const authenticationResponse = userSignUpResponse.value as AuthenticationResult

        expect(authenticationResponse.data).toEqual({
            id: "valid_id",
            email: 'valid@email.com',
            name: 'valid name',
        })
        expect(authenticationResponse.accessToken).toBeTruthy()
        expect(authenticationResponse.iat).toBeDefined()
        expect(authenticationResponse.exp).toBeDefined()

        expect((await emptyUserRepository.findUserByEmail(validUserSignUpRequest.email))?.password).toEqual(validUserSignUpRequest.password + 'ENCRYPTED')
    })

    test("should not sign up existing user", async () => {
        const validUser: UserData = {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }
        const userDataArray: UserData[] = [ validUser ]
        const userRepository = new InMemoryUserRepository(userDataArray)
        const encoder: Encoder = new FakeEncoder()
        const authenticationStub = new AuthenticationServiceStub()
        const sut: SignUp = new SignUp(userRepository, encoder, authenticationStub)

        const validUserSignUpRequest: UserData = {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }
        const error = await sut.perform(validUserSignUpRequest)
        expect(error.value).toBeInstanceOf(ExistingUserError)


    })

    describe("should not sing up user with invalid data", () => {
        test("should not sign up user with invalid email", async () => {
            const invalidUserSignUpRequest: UserData = {
                name: 'any name',
                email: 'invalidemail',
                password: 'validpassword',
            }
    
            const emptyUserRepository = new InMemoryUserRepository([])
            const encoder: Encoder = new FakeEncoder()
            const authenticationStub = new AuthenticationServiceStub()
            const sut: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidEmailError)
        })
    
        test("should not sign up user with invalid password", async () => {
            const invalidUserSignUpRequest: UserData = {
                name: 'any name',
                email: 'valid@email.com',
                password: '',
            }
    
            const emptyUserRepository = new InMemoryUserRepository([])
            const encoder: Encoder = new FakeEncoder()
            const authenticationStub = new AuthenticationServiceStub()
            const sut: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidPasswordError)
        })
    
        test("should not sign up user with invalid name", async () => {
            const invalidUserSignUpRequest: UserData = {
                name: '',
                email: 'valid@email.com',
                password: 'validpassword',
            }
    
            const emptyUserRepository = new InMemoryUserRepository([])
            const encoder: Encoder = new FakeEncoder()
            const authenticationStub = new AuthenticationServiceStub()
            const sut: SignUp = new SignUp(emptyUserRepository, encoder, authenticationStub)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidNameError)
        })
    })

})