import request from 'supertest'
import app from '@/main/config/app'
import { PluggyDataProvider } from '@/external/financial-data-provider'
import { right } from '@/shared'

jest.mock('@/external/financial-data-provider')
const mockedDataProvider = jest.mocked(PluggyDataProvider)

describe('Pluggy Connect Widget - create token route', () => {
    test('should return a generic token', async () => {
        const validAccessToken = 'valid-access-token'
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async () => { return right(validAccessToken)})

        await request(app)
            .get('/api/pluggy/create-token')
            .expect(201)
            .then((res) => {
                expect(res.body.accessToken).toBe(validAccessToken)
            })
    })

    test('should return a specific token', async () => {
        const validAccessToken = 'valid-access-token'
        const itemId = 'valid-item-id'
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async ({itemId}) => { return right(validAccessToken + itemId)})

        await request(app)
            .get(`/api/pluggy/create-token?itemId=${itemId}`)
            .expect(201)
            .then((res) => {
                expect(res.body.accessToken).toBe(validAccessToken + itemId)
            })
    })

    test('should receive an optional clientUserId', async () => {
        const validAccessToken = 'valid-access-token'
        const itemId = 'valid-item-id'
        const clientUserId = 'valid-user-id'
        mockedDataProvider.prototype.getConnectToken.mockImplementationOnce(async ({itemId}) => { return right(validAccessToken + itemId)})

        await request(app)
            .get(`/api/pluggy/create-token?itemId=${itemId}&clientUserId=${clientUserId}`)
            .expect(201)
            .then((res) => {
                expect(res.body.accessToken).toBe(validAccessToken + itemId)
            })

        expect(mockedDataProvider.prototype.getConnectToken).toHaveBeenCalledWith({ itemId, clientUserId })
    })
})