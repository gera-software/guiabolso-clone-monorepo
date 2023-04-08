import { Connector, PluggyClient } from 'pluggy-sdk'
import { PluggyDataProvider } from "@/external/financial-data-provider"
jest.mock('pluggy-sdk')
const mockedPluggyClient = jest.mocked(PluggyClient)

describe('Pluggy Data Provider', () => {
    beforeEach(() => {
        mockedPluggyClient.mockClear()
    })

    describe('get available automatic institutions', () => {
        test('should return a list of available institutions', async () => {
            const arrayConnectors: Connector[] = [
                {
                    id: 201,
                    name: 'Itaú',
                    imageUrl: 'url itau',
                    primaryColor: 'fff',
                    type: 'PERSONAL_BANK',
                    institutionUrl: '',
                    country: '',
                    credentials: null,
                    hasMFA: false,
                },
                {
                    id: 202,
                    name: 'Nubank',
                    imageUrl: 'url nubank',
                    primaryColor: '000',
                    type: 'BUSINESS_BANK',
                    institutionUrl: '',
                    country: '',
                    credentials: null,
                    hasMFA: false,
                }
            ]
            mockedPluggyClient.prototype.fetchConnectors.mockResolvedValueOnce({ results: arrayConnectors })

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const result = await sut.getAvailableAutomaticInstitutions()
            expect(result.length).toBe(2)
            expect(result[0]).toEqual({
                id: null,
                providerConnectorId: '201',
                name: 'Itaú',
                imageUrl: 'url itau',
                primaryColor: '#fff',
                type: 'PERSONAL_BANK',
            })
            expect(result[1]).toEqual({
                id: null,
                providerConnectorId: '202',
                name: 'Nubank',
                imageUrl: 'url nubank',
                primaryColor: '#000',
                type: 'BUSINESS_BANK',
            })
        })
    })
})