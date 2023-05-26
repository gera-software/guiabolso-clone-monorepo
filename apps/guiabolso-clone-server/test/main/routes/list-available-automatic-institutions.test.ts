import request from 'supertest'
import app from '@/main/config/app'
import { Connector, PluggyClient } from 'pluggy-sdk'
jest.mock('pluggy-sdk')
const mockedPluggyClient = jest.mocked(PluggyClient)

describe('list all available automatic institutions', () => {

    beforeEach(() => {
        mockedPluggyClient.mockClear()

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
                products: [],
                createdAt: new Date()
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
                products: [],
                createdAt: new Date()
            }
        ]
        mockedPluggyClient.prototype.fetchConnectors.mockResolvedValueOnce({ 
            "total": 2,
            "totalPages": 1,
            "page": 1,
            results: arrayConnectors 
        })

    })

    test('should list all available automatic institutions', async () => {
        await request(app)
            .get('/api/available-automatic-institutions')
            .expect(200)
            .then((res) => {
                expect(res.body.length).toBe(2)
            })
    })
})