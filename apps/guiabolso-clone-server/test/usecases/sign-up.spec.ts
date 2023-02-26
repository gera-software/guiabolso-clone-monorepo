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
})