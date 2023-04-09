import { left, right } from "@/shared"
import { UnauthenticatedError, UnexpectedError } from "@/usecases/errors"
import { PluggyConnectWidgetCreateToken } from "@/usecases/pluggy-connect-widget-create-token"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"

jest.mock('@test/doubles/financial-data-provider')
const mockedDataProvider = jest.mocked(InMemoryPluggyDataProvider)

describe('Pluggy Connect Widget - create a connect token use case', () => {
    test('should create a connect token', async () => {
        mockedDataProvider.prototype.getConnectToken.mockResolvedValueOnce(right('valid-access-token'))

        const finantialDataProvider = new InMemoryPluggyDataProvider([])
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({ itemId: ''})).value
        expect(response).toBe('valid-access-token')
    })

    test('should return an unauthenticated error', async () => {
        mockedDataProvider.prototype.getConnectToken.mockResolvedValueOnce(left(new UnauthenticatedError()))

        const finantialDataProvider = new InMemoryPluggyDataProvider([])
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({ itemId: ''})).value as Error

        expect(response).toBeInstanceOf(UnauthenticatedError)
    })

    test('should return an unexpected error', async () => {
        mockedDataProvider.prototype.getConnectToken.mockResolvedValueOnce(left(new UnexpectedError()))

        const finantialDataProvider = new InMemoryPluggyDataProvider([])
        const sut = new PluggyConnectWidgetCreateToken(finantialDataProvider)

        const response = (await sut.perform({ itemId: ''})).value as Error

        expect(response).toBeInstanceOf(UnexpectedError)
    })

})