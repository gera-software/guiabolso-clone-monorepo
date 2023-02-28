import { ListInstitutionsByType } from "@/usecases/list-institutions-by-type"
import { InstitutionData, UseCase } from "@/usecases/ports"
import { ListInstitutionsByTypeController } from "@/web-controllers"
import { MissingParamError } from "@/web-controllers/errors"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryInstitutionRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

const institutionsArray: InstitutionData[] = []
institutionsArray.push({
    id: '0', 
    name: 'institution 0', 
    type: 'PERSONAL_BANK', 
    imageUrl: 'url 0', 
    primaryColor: 'color 0',
    providerConnectorId: 'connector 0'
})
institutionsArray.push({
    id: '1', 
    name: 'institution 1', 
    type: 'BUSINESS_BANK', 
    imageUrl: 'url 1', 
    primaryColor: 'color 1',
    providerConnectorId: 'connector 1'
})
institutionsArray.push({
    id: '2', 
    name: 'institution 2', 
    type: 'INVESTMENT', 
    imageUrl: 'url 2', 
    primaryColor: 'color 2',
    providerConnectorId: 'connector 2'
})


describe('List institutions by type web controller', () => {
    test('should return status code 400 bad request when request is missing required params', async () => {
        const institutionRepo = new InMemoryInstitutionRepository(institutionsArray)
        const usecase = new ListInstitutionsByType(institutionRepo)
        const sut = new ListInstitutionsByTypeController(usecase)

        const invalidRequest: HttpRequest = {
            query: {
                // type: ''
            }
        }

        const response: HttpResponse = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body as Error).toBeInstanceOf(MissingParamError)
        expect(response.body.message).toBe("Missing parameters from request: type.")
    })

    test('should return status code 200 when request is valid', async () => {
        const institutionRepo = new InMemoryInstitutionRepository(institutionsArray)
        const usecase = new ListInstitutionsByType(institutionRepo)
        const sut = new ListInstitutionsByTypeController(usecase)

        const validRequest: HttpRequest = {
            query: {
                type: 'PERSONAL_BANK'
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toEqual(1)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new ListInstitutionsByTypeController(errorThrowingUseCaseStub)

        const validRequest: HttpRequest = {
            query: {
                type: 'PERSONAL_BANK'
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })
})