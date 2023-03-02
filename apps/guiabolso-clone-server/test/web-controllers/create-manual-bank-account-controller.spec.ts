import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { UnregisteredUserError } from "@/usecases/errors"
import { BankAccountData, InstitutionData, UseCase } from "@/usecases/ports"
import { CreateManualBankAccountController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Create manual bank account web controller', () => {
    const validUser = {
        id: 'valid user id',
        name: 'valid name',
        email: 'valid@email.com',
        password: 'valid password',
    }

    const validInstitution: InstitutionData = {
        id: 'id 0',
        name: 'institution name',
        type: 'PERSONAL_BANK',
        imageUrl: 'url',
        primaryColor: 'color',
        providerConnectorId: 'valid id'
    }

    test('should return status code 400 bad request when request is missing required params', async () => {
        const userRepo = new InMemoryUserRepository([validUser])
        const accountRepo = new InMemoryAccountRepository([])
        const institutionRepo = new InMemoryInstitutionRepository([validInstitution])
        const usecase = new CreateManualBankAccount(accountRepo, userRepo, institutionRepo)
        const sut = new CreateManualBankAccountController(usecase)

        const invalidRequest: HttpRequest = {
            body: {
                // type: "BANK",
                // name: "banco válido",
                // balance: 50,
                // userId: "valid user id"
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
        const institutionRepo = new InMemoryInstitutionRepository([validInstitution])
        const usecase = new CreateManualBankAccount(accountRepo, userRepo, institutionRepo)
        const sut = new CreateManualBankAccountController(usecase)

        const validRequest: HttpRequest = {
            body: {
                type: "BANK",
                name: "banco válido",
                balance: 50,
                userId: "valid user id",
                institution: {
                    id: 'id 0',
                    name: 'institution name',
                    type: 'PERSONAL_BANK',
                    imageUrl: 'url',
                    primaryColor: 'color',
                    providerConnectorId: 'valid id'
                }
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(201)
        expect(response.body.id).toBeTruthy()
        expect(response.body.institution).toEqual(validInstitution)
    })

    test('should return status code 400 bad request when user is not found', async () => {
        const userRepo = new InMemoryUserRepository([validUser])
        const accountRepo = new InMemoryAccountRepository([])
        const institutionRepo = new InMemoryInstitutionRepository([validInstitution])
        const usecase = new CreateManualBankAccount(accountRepo, userRepo, institutionRepo)
        const sut = new CreateManualBankAccountController(usecase)

        const invalidRequest: HttpRequest = {
            body: {
                type: "BANK",
                name: "banco válido",
                balance: 50,
                userId: "invalid user id"
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(UnregisteredUserError)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new CreateManualBankAccountController(errorThrowingUseCaseStub)

        const validRequest: HttpRequest = {
            body: {
                type: "BANK",
                name: "banco válido",
                balance: 50,
                userId: "valid user id",
                institution: null,
            }
        }
        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })
})