import { Connector, PluggyClient } from 'pluggy-sdk'
import { PluggyDataProvider } from "@/external/financial-data-provider"
import { UnexpectedError } from '@/usecases/errors'
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

    describe('get connect token', () => {
        test('should returns a generic connect token', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockResolvedValueOnce({ accessToken: validAccessToken })

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const result = (await sut.getConnectToken()).value
            expect(result).toBe(validAccessToken)
        })

        test('should returns a specific connect token', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockImplementationOnce(async (itemId) => ({ accessToken: validAccessToken + itemId }))

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken(itemId)).value
            expect(result).toBe(validAccessToken + itemId)
        })

        test('should returns UnexpectedError if invalid authorization token', async () => {
            mockedPluggyClient.prototype.createConnectToken.mockRejectedValueOnce({ code: 403, message: "Missing or invalid authorization token" })

            const invalidClientId = 'invalid-client-id'
            const invalidClientSecret = 'invalid-client-secret'
            const sut = new PluggyDataProvider(invalidClientId, invalidClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken(itemId)).value as Error
            expect(result).toBeInstanceOf(UnexpectedError)
        })

        test('should returns UnexpectedError if has a internal server error', async () => {
            mockedPluggyClient.prototype.createConnectToken.mockRejectedValueOnce({ code: 500, message: "Internal Server Error" })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken(itemId)).value as Error
            expect(result).toBeInstanceOf(UnexpectedError)
        })
    })
})