import { Token } from "@/entities"
import { InvalidUserError, UnregisteredUserError } from "@/usecases/errors"
import { SendUserValidationToken } from "@/usecases/send-user-validation-token"
import { InMemoryTokenRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import crypto from "crypto";
import * as sinon from 'sinon'

describe('Send user validation token use case', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should not send a token if user does not exists', async () => {
        const userId = 'invalid-user-id'

        const tokenRepository = new InMemoryTokenRepository([])
        const userRepository = new InMemoryUserRepository([])
        const sut = new SendUserValidationToken(userRepository, tokenRepository)

        const response = (await sut.perform(userId)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })

    test('should not send a token if user already is verified', async () => {
        const userId = 'valid-user-id'

        const userData = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            isVerified: true,
            id: userId,
        }

        const tokenRepository = new InMemoryTokenRepository([])
        const userRepository = new InMemoryUserRepository([userData])
        const sut = new SendUserValidationToken(userRepository, tokenRepository)

        const response = (await sut.perform(userId)).value as Error
        expect(response).toBeInstanceOf(InvalidUserError)
        expect(response.message).toBe('Usuário já verificado')
    })

    test('should generate a token if user is not verified', async () => {
        const clock = sinon.useFakeTimers()

        const userId = 'valid-user-id'

        const userData = {
            name: 'valid name',
            email: 'valid@email.com',
            password: 'validENCRYPTED',
            isVerified: false,
            id: userId,
        }

        const hashMock = {
            // update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValueOnce('valid-hash'),
        };
        // @ts-ignore
        const createHashMock = jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => hashMock);

        const tokenRepository = new InMemoryTokenRepository([])
        const userRepository = new InMemoryUserRepository([userData])
        const sut = new SendUserValidationToken(userRepository, tokenRepository)



        const response = (await sut.perform(userId)).value as Token
        expect(response.type).toBe("USER-VALIDATION-TOKEN")
        expect(response.userId).toBe(userId)
        expect(response.hash).toBe('valid-hash')
        // const sixHours: number = 3600100 * 6
        // clock.tick(sixHours)
        // expect(response.expireAt).toEqual(new Date())

        expect(createHashMock).toBeCalledWith('sha256')
        expect(hashMock.digest).toBeCalledWith('hex')
        clock.restore()
    })
})