import request from 'supertest'
import app from '@/main/config/app'
import { MongoHelper } from '@/external/repositories/mongodb/helper'
import { MongodbInstitution } from '@/external/repositories/mongodb'

describe('list institutions by type route', () => {
    const institutionsArray: MongodbInstitution[] = []
    institutionsArray.push({
        _id: null,
        name: 'institution 0', 
        type: 'PERSONAL_BANK', 
        imageUrl: 'url 0', 
        primaryColor: 'color 0',
        providerConnectorId: 'connector 0'
    })
    institutionsArray.push({
        _id: null,
        name: 'institution 1', 
        type: 'BUSINESS_BANK', 
        imageUrl: 'url 1', 
        primaryColor: 'color 1',
        providerConnectorId: 'connector 1'
    })
    institutionsArray.push({
        _id: null,
        name: 'institution 2', 
        type: 'INVESTMENT', 
        imageUrl: 'url 2', 
        primaryColor: 'color 2',
        providerConnectorId: 'connector 2'
    })

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        const institutionCollection = MongoHelper.getCollection('institutions')
        await institutionCollection.insertMany(institutionsArray)
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.disconnect()
    })

    test('should list all institutions by a type', async () => {
        await request(app)
            .get('/api/institution?type=PERSONAL_BANK')
            .expect(200)
            .then((res) => {
                expect(res.body.length).toBe(1)
            })
    })
})