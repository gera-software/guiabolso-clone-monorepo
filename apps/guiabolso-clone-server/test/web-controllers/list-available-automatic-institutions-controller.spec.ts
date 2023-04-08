import { ListAvailableAutomaticInstitutions } from "@/usecases/list-available-automatic-institutions"
import { InstitutionData, UseCase } from "@/usecases/ports"
import { ListAvailableAutomaticInstitutionsController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('List all available automatic institutions web controller', () => {
    test('should return status code 200', async () => {
        const arrayConnectors: InstitutionData[] = [
            {
                id: null,
                providerConnectorId: '201',
                name: 'Itaú',
                imageUrl: 'url itau',
                primaryColor: '#fff',
                type: 'PERSONAL_BANK',
            },
            {
                id: null,
                providerConnectorId: '202',
                name: 'Nubank',
                imageUrl: 'url nubank',
                primaryColor: '#000',
                type: 'BUSINESS_BANK',
            }
        ]
        const financialDataProvider = new InMemoryPluggyDataProvider(arrayConnectors)
        const usecase = new ListAvailableAutomaticInstitutions(financialDataProvider)
        const sut = new ListAvailableAutomaticInstitutionsController(usecase)

        const validRequest: HttpRequest = {}

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toEqual(2)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new ListAvailableAutomaticInstitutionsController(errorThrowingUseCaseStub)

        const validRequest: HttpRequest = {}

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })
})