import { ListAvailableConnectors } from "@/usecases/list-available-connectors"
import { ConnectorData } from "@/usecases/ports"

describe('List available connectors use case', () => {

    test('should list all available connectors', async () => {
        const sut = new ListAvailableConnectors()
        const response = (await sut.perform({})).value as ConnectorData[]
        expect(response.length).toBe(2)
        expect(response[0]).toBe({
            providerConnectorId: '201',
            name: 'Itaú',
            imageUrl: 'url itau',
            primaryColor: '#fff',
            type: 'PERSONAL_BANK',
        })
        expect(response[1]).toBe({
            providerConnectorId: '202',
            name: 'Nubank',
            imageUrl: 'url nubank',
            primaryColor: '#000',
            type: 'BUSINESS_BANK',
        })


    })
})