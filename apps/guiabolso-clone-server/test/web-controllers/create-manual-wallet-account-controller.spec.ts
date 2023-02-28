import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { UnregisteredUserError } from "@/usecases/errors"
import { UseCase } from "@/usecases/ports"
import { CreateManualWalletAccountController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryAccountRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Create manual wallet account web controller', () => {
    const validUser = {
        id: 'valid user id',
        name: 'valid name',
        email: 'valid@email.com',
        password: 'valid password',
    }

    test('should return status code 400 bad request when request is missing required params', async () => {
        const userRepo = new InMemoryUserRepository([validUser])
        const accountRepo = new InMemoryAccountRepository([])
        const usecase = new CreateManualWalletAccount(accountRepo, userRepo)
        const sut = new CreateManualWalletAccountController(usecase)

        const invalidRequest: HttpRequest = {
            body: {
            //   name: 'account name',
            //   balance: 234,
              imageUrl: 'valid url',
            //   userId: 'invalid user id'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect(response.body.message).toBe("Missing parameters from request: userId, name, balance.")
    })

    test('should return status code 201 created when request is valid', async () => {
        const userRepo = new InMemoryUserRepository([validUser])
        const accountRepo = new InMemoryAccountRepository([])
        const usecase = new CreateManualWalletAccount(accountRepo, userRepo)
        const sut = new CreateManualWalletAccountController(usecase)

        const validRequest: HttpRequest = {
            body: {
              name: 'account name',
              balance: 234,
              imageUrl: 'valid url',
              userId: 'valid user id'
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(201)
        expect(response.body.id).toBeDefined()
    })

    test('should return status code 400 bad request when user is not found', async () => {
        const userRepo = new InMemoryUserRepository([])
        const accountRepo = new InMemoryAccountRepository([])
        const usecase = new CreateManualWalletAccount(accountRepo, userRepo)
        const sut = new CreateManualWalletAccountController(usecase)

        const invalidRequest: HttpRequest = {
            body: {
              name: 'account name',
              balance: 234,
              imageUrl: 'valid url',
              userId: 'invalid user id'
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(UnregisteredUserError)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new CreateManualWalletAccountController(errorThrowingUseCaseStub)

        const validRequest: HttpRequest = {
            body: {
              name: 'account name',
              balance: 234,
              imageUrl: 'valid url',
              userId: 'valid user id'
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })

})