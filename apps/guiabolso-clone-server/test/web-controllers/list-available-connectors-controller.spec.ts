import { ListAvailableConnectors } from "@/usecases/list-available-connectors"
import { ConnectorData, UseCase } from "@/usecases/ports"
import { ListAvailableConnectorsController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

describe('List all available connectors web controller', () => {
    test('should return status code 200', async () => {
        const arrayConnectors: ConnectorData[] = [
            {
                providerConnectorId: '201',
                name: 'Itaú',
                imageUrl: 'url itau',
                primaryColor: '#fff',
                type: 'PERSONAL_BANK',
            },
            {
                providerConnectorId: '202',
                name: 'Nubank',
                imageUrl: 'url nubank',
                primaryColor: '#000',
                type: 'BUSINESS_BANK',
            }
        ]
        const financialDataProvider = new InMemoryPluggyDataProvider(arrayConnectors)
        const usecase = new ListAvailableConnectors(financialDataProvider)
        const sut = new ListAvailableConnectorsController(usecase)

        const validRequest: HttpRequest = {}

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toEqual(2)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new ListAvailableConnectorsController(errorThrowingUseCaseStub)

        const validRequest: HttpRequest = {}

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })
})