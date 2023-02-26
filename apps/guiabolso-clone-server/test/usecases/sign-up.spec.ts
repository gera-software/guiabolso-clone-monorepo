import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { UserData } from "@/usecases/ports"
import { SignUp } from "@/usecases/sign-up"
import { InMemoryUserRepository } from "@test/doubles"

describe("Sing up use case", () => {
    test("should sign up user with valid data", async () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        // const sut: SignUp = new SigUp(emptyUserRepository, encoder, authenticationStub)
        const sut: SignUp = new SignUp(emptyUserRepository)

        const validUserSignUpRequest: UserData = {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }
        const userSignUpResponse = await sut.perform(validUserSignUpRequest)
        // expect((userSignUpResponse.value as AuthenticationResult).id).toBeDefined()
        // expect((userSignUpResponse.value as AuthenticationResult).accessToken).toBeDefined()
        expect((await emptyUserRepository.findAll()).length).toEqual(1)
        expect((await emptyUserRepository.findByEmail(validUserSignUpRequest.email)).password).toEqual(validUserSignUpRequest.password)
    })

    describe("should not sing up user with invalid data", () => {
        test("should not sign up user with invalid email", async () => {
            const invalidUserSignUpRequest: UserData = {
                name: 'any name',
                email: 'invalidemail',
                password: 'validpassword',
            }
    
            const emptyUserRepository = new InMemoryUserRepository([])
            const sut: SignUp = new SignUp(emptyUserRepository)
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
            const sut: SignUp = new SignUp(emptyUserRepository)
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
            const sut: SignUp = new SignUp(emptyUserRepository)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidNameError)
        })
    })

})