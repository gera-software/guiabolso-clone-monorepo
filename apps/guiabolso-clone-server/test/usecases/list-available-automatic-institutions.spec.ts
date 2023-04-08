import { ListAvailableAutomaticInstitutions } from "@/usecases/list-available-automatic-institutions"
import { InstitutionData } from "@/usecases/ports"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"

describe('List available automatic institutions use case', () => {

    test('should list all available automatic institutions', async () => {
        const arrayInstitutions: InstitutionData[] = [
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
        const financialDataProvider = new InMemoryPluggyDataProvider(arrayInstitutions)
        const sut = new ListAvailableAutomaticInstitutions(financialDataProvider)
        const response = (await sut.perform({})).value as InstitutionData[]
        expect(response.length).toBe(2)
        expect(response[0]).toEqual(arrayInstitutions[0])
        expect(response[1]).toEqual(arrayInstitutions[1])
    })
})