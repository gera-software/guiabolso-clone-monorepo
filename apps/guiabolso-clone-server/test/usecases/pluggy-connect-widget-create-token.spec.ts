import { left, right } from "@/shared"
import { UnexpectedError } from "@/usecases/errors"
import { PluggyConnectWidgetCreateToken } from "@/usecases/pluggy-connect-widget-create-token"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"

jest.mock('@test/doubles/financial-data-provider')
const mockedDataProvider = jest.mocked(InMemoryPluggyDataProvider)

describe('Pluggy Connect Widget - create a connect token use case', () => {
    test('should create a generic connect token', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async () => { return right('valid-access-token')})

        const finantialDataProvider = new InMemoryPluggyDataProvider([])
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({})).value
        expect(response).toBe('valid-access-token')
    })

    test('should create a specific connect token to update an item', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async (itemId) => { return right('valid-access-token-' + itemId)})
        
        const finantialDataProvider = new InMemoryPluggyDataProvider([])
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)
        
        const validItemId = 'valid-item-id'
        const response = (await sut.perform({ itemId: validItemId })).value
        expect(response).toBe('valid-access-token-' + validItemId)
    })

    test('should return an UnexpectedError error', async () => {
        mockedDataProvider.prototype.getConnectToken.mockResolvedValueOnce(left(new UnexpectedError()))

        const finantialDataProvider = new InMemoryPluggyDataProvider([])
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({ itemId: ''})).value as Error

        expect(response).toBeInstanceOf(UnexpectedError)
    })
})