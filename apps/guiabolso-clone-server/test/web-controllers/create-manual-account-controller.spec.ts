import { CreateManualAccount } from "@/usecases/create-manual-account"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { CreateManualCreditCardAccount } from "@/usecases/create-manual-credit-card-account"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { UnregisteredUserError } from "@/usecases/errors"
import { UseCase } from "@/usecases/ports"
import { CreateManualAccountController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryUserRepository, InMemoryAccountRepository, InMemoryInstitutionRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('Create manual account web controller', () => {
    describe('manual wallet account', () => {
        const validUser = {
            id: 'valid user id',
            name: 'valid name',
            email: 'valid@email.com',
            password: 'valid password',
        }
    
        test('should return status code 400 bad request when request is missing required params', async () => {
            const userRepository = new InMemoryUserRepository([validUser])
            const accountRepository = new InMemoryAccountRepository([])
            const institutionRepository = new InMemoryInstitutionRepository([])
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
            const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
            const usecase = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)

            const sut = new CreateManualAccountController(usecase)
    
            const invalidRequest: HttpRequest = {
                body: {
                //   type: 'WALLET',
                //   name: 'account name',
                //   balance: 234,
                  imageUrl: 'valid url',
                //   userId: 'invalid user id'
                }
            }
    
            const response: HttpResponse = await sut.handle(invalidRequest)
            expect(response.statusCode).toEqual(400)
            expect(response.body as Error).toBeInstanceOf(MissingParamError)
            expect(response.body.message).toBe("Missing parameters from request: type, userId, name, balance.")
        })
    
        test('should return status code 201 created when request is valid', async () => {
            const userRepository = new InMemoryUserRepository([validUser])
            const accountRepository = new InMemoryAccountRepository([])
            const institutionRepository = new InMemoryInstitutionRepository([])
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
            const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
            const usecase = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)

            const sut = new CreateManualAccountController(usecase)
    
            const validRequest: HttpRequest = {
                body: {
                  type: 'WALLET',
                  name: 'account name',
                  balance: 234,
                  imageUrl: 'valid url',
                  userId: 'valid user id'
                }
            }
    
            const response: HttpResponse = await sut.handle(validRequest)
            expect(response.statusCode).toEqual(201)
            expect(response.body.id).toBeTruthy()
        })
    
        test('should return status code 400 bad request when user is not found', async () => {
            const userRepository = new InMemoryUserRepository([])
            const accountRepository = new InMemoryAccountRepository([])
            const institutionRepository = new InMemoryInstitutionRepository([])
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
            const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
            const usecase = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)

            const sut = new CreateManualAccountController(usecase)
    
            const invalidRequest: HttpRequest = {
                body: {
                  type: 'WALLET',
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
            const sut = new CreateManualAccountController(errorThrowingUseCaseStub)

    
            const validRequest: HttpRequest = {
                body: {
                  type: 'WALLET',
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
})