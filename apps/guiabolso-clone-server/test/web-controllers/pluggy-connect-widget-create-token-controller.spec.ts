import { left, right } from "@/shared"
import { DataProviderError } from "@/usecases/errors"
import { PluggyConnectWidgetCreateToken } from "@/usecases/pluggy-connect-widget-create-token"
import { UseCase } from "@/usecases/ports"
import { PluggyConnectWidgetCreateTokenController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryPluggyDataProvider } from "@test/doubles/financial-data-provider"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

jest.mock('@test/doubles/financial-data-provider')
const mockedDataProvider = jest.mocked(InMemoryPluggyDataProvider)

describe('Pluggy Connect Widget - create token controller', () => {
    test('should return status 201 created and generic connect token', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async () => { return right('valid-access-token')})

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const usecase = new PluggyConnectWidgetCreateToken(financialDataProvider)
        const sut = new PluggyConnectWidgetCreateTokenController(usecase)

        const validRequest: HttpRequest = {
            body: {

            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(201)
        expect(response.body).toEqual({ accessToken:'valid-access-token' })
    })

    test('should return status 201 created and specific connect token', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async ({itemId}) => { return right('valid-access-token-' + itemId)})

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const usecase = new PluggyConnectWidgetCreateToken(financialDataProvider)
        const sut = new PluggyConnectWidgetCreateTokenController(usecase)

        const validItemId = 'valid-item-id'
        const validRequest: HttpRequest = {
            body: {
            },
            query: {
                itemId: validItemId
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(201)
        expect(response.body).toEqual({ accessToken:'valid-access-token-' + validItemId })
    })

    test('should receive an optional clientUserId', async () => {
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async () => { return right('valid-access-token')})

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const usecase = new PluggyConnectWidgetCreateToken(financialDataProvider)
        const sut = new PluggyConnectWidgetCreateTokenController(usecase)

        const clientUserId = 'valid-user-id'
        const validRequest: HttpRequest = {
            body: {

            }, 
            query: {
                clientUserId
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(201)
        expect(response.body).toEqual({ accessToken:'valid-access-token' })
        expect(mockedDataProvider.prototype.getConnectToken).toHaveBeenCalledWith({ clientUserId })
    })

    test('should return status 400 when data provider returns error', async () => {
        mockedDataProvider.prototype.getConnectToken.mockResolvedValueOnce(left(new DataProviderError()))

        const financialDataProvider = new InMemoryPluggyDataProvider({ institutions: [] })
        const usecase = new PluggyConnectWidgetCreateToken(financialDataProvider)
        const sut = new PluggyConnectWidgetCreateTokenController(usecase)

        const validItemId = 'valid-item-id'
        const validRequest: HttpRequest = {
            body: {
            }, 
            query: {
                itemId: validItemId
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.name).toBe('DataProviderError')
    })

    test('should return status 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new PluggyConnectWidgetCreateTokenController(errorThrowingUseCaseStub)

        const validItemId = 'valid-item-id'
        const validRequest: HttpRequest = {
            body: {
            }, 
            query: {
                itemId: validItemId
            }
        }

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })

})