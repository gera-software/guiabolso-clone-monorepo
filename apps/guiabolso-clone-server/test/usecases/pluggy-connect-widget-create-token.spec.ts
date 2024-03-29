import { left, right } from "@/shared"
import { DataProviderError } from "@/usecases/errors"
import { PluggyConnectWidgetCreateToken } from "@/usecases/pluggy-connect-widget-create-token"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"

jest.mock('@test/doubles/financial-data-provider')
const mockedDataProvider = jest.mocked(InMemoryPluggyDataProvider)

describe('Pluggy Connect Widget - create a connect token use case', () => {
    test('should create a generic connect token', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async () => { return right('valid-access-token')})

        const finantialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({})).value
        expect(response).toBe('valid-access-token')
        expect(mockedDataProvider.prototype.getConnectToken).toHaveBeenCalledWith({itemId: undefined, clientUserId: undefined})
    })

    test('should create a specific connect token to update an item', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async ({itemId}) => { return right('valid-access-token-' + itemId)})
        
        const finantialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)
        
        const validItemId = 'valid-item-id'
        const response = (await sut.perform({ itemId: validItemId })).value
        expect(response).toBe('valid-access-token-' + validItemId)
        expect(mockedDataProvider.prototype.getConnectToken).toHaveBeenCalledWith({itemId: validItemId, clientUserId: undefined})

    })

    test('should receive an optional clientUserId', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async () => { return right('valid-access-token')})

        const finantialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const clientUserId = 'valid-user-id'
        const response = (await sut.perform({ clientUserId })).value
        expect(response).toBe('valid-access-token')
        expect(mockedDataProvider.prototype.getConnectToken).toHaveBeenCalledWith({clientUserId, itemId: undefined})
    })

    test('should return an UnexpectedError error', async () => {
        mockedDataProvider.prototype.getConnectToken.mockResolvedValueOnce(left(new DataProviderError()))

        const finantialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({ itemId: ''})).value as Error

        expect(response).toBeInstanceOf(DataProviderError)
    })
})