import { InMemoryUserRepository } from "@test/doubles"

describe("Sing up use case", () => {
    test("should sign up user with valid data", () => {
        const emptyUserRepository = new InMemoryUserRepository([])
        // const sut: SignUp = new SigUp(emptyUserRepository, encoder, authenticationStub)
        // const userSignUpResponse = await sut.perform(validUserSignupRequest)
        // expect((userSignUpResponse.value as AuthenticationResult).id).toBeDefined()
        // expect((userSignUpResponse.value as AuthenticationResult).accessToken).toBeDefined()
    })
})