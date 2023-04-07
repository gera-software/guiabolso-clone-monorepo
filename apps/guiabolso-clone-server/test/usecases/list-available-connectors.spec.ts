import { ListAvailableConnectors } from "@/usecases/list-available-connectors"
import { ConnectorData } from "@/usecases/ports"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"

describe('List available connectors use case', () => {

    test('should list all available connectors', async () => {
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
        const sut = new ListAvailableConnectors(financialDataProvider)
        const response = (await sut.perform({})).value as ConnectorData[]
        expect(response.length).toBe(2)
        expect(response[0]).toEqual(arrayConnectors[0])
        expect(response[1]).toEqual(arrayConnectors[1])
    })
})