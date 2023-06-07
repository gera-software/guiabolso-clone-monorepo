import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Encoder, UserData } from "@/usecases/ports"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"
import { SignUp } from "@/usecases/sign-up"
import { ExistingUserError } from "@/usecases/sign-up/errors"
import { FakeTokenManager } from "@test/doubles/authentication"
import { FakeEncoder } from "@test/doubles/encoder"
import { FakeMailService } from "@test/doubles/mail"
import { InMemoryUserRepository } from "@test/doubles/repositories"

describe("Sing up use case", () => {
    test("should sign up user with valid data", async () => {
        const userRepository = new InMemoryUserRepository([])
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const sut: SignUp = new SignUp(userRepository, encoder, sendUserValidationTokenUsecase)

        const validUserSignUpRequest: UserData = {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }
        const result = (await sut.perform(validUserSignUpRequest)).value as UserData

        expect(result).toEqual({
            id: "0",
            email: 'any@mail.com',
            name: 'any name',
            isVerified: false
        })

        const foundUser = await userRepository.findUserByEmail(validUserSignUpRequest.email)
        expect(foundUser?.password).toEqual(validUserSignUpRequest.password + 'ENCRYPTED')
        expect(foundUser?.isVerified).toEqual(false)

        const sendedEmail = fakeMailService._sended[0]
        expect(sendedEmail.subject).toBe('[Guiabolso Clone] Valide seu email')
        expect(sendedEmail.to).toBe(validUserSignUpRequest.email)
    })

    test("should not sign up existing user (same email)", async () => {
        const validUser: UserData = {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }
        const userDataArray: UserData[] = [ validUser ]
        const userRepository = new InMemoryUserRepository(userDataArray)
        const encoder: Encoder = new FakeEncoder()
        const fakeTokenManager = new FakeTokenManager()
        const fakeMailService = new FakeMailService()
        const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
        const sut: SignUp = new SignUp(userRepository, encoder, sendUserValidationTokenUsecase)

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
    
            const userRepository = new InMemoryUserRepository([])
            const encoder: Encoder = new FakeEncoder()
            const fakeTokenManager = new FakeTokenManager()
            const fakeMailService = new FakeMailService()
            const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
            const sut: SignUp = new SignUp(userRepository, encoder, sendUserValidationTokenUsecase)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidEmailError)
        })
    
        test("should not sign up user with invalid password", async () => {
            const invalidUserSignUpRequest: UserData = {
                name: 'any name',
                email: 'valid@email.com',
                password: '',
            }
    
            const userRepository = new InMemoryUserRepository([])
            const encoder: Encoder = new FakeEncoder()
            const fakeTokenManager = new FakeTokenManager()
            const fakeMailService = new FakeMailService()
            const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
            const sut: SignUp = new SignUp(userRepository, encoder, sendUserValidationTokenUsecase)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidPasswordError)
        })
    
        test("should not sign up user with invalid name", async () => {
            const invalidUserSignUpRequest: UserData = {
                name: '',
                email: 'valid@email.com',
                password: 'validpassword',
            }
    
            const userRepository = new InMemoryUserRepository([])
            const encoder: Encoder = new FakeEncoder()
            const fakeTokenManager = new FakeTokenManager()
            const fakeMailService = new FakeMailService()
            const sendUserValidationTokenUsecase = new SendUserValidationToken(userRepository, fakeTokenManager, fakeMailService, process.env.FRONTEND_URL)
            const sut: SignUp = new SignUp(userRepository, encoder, sendUserValidationTokenUsecase)
            const error = await sut.perform(invalidUserSignUpRequest)
            expect(error.value).toBeInstanceOf(InvalidNameError)
        })
    })

})