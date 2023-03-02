import request from 'supertest'
import app from '@/main/config/app'

import { MongodbInstitution } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { makeInstitutionRepository, makeUserRepository } from "@/main/factories"
import { InstitutionData, UserData } from "@/usecases/ports"

describe('create manual bank account route', () => {
    const userRepo = makeUserRepository()
    const institutionRepo = makeInstitutionRepository()
    let validUser: UserData
    let validInstitution: InstitutionData

    const institutionsArray: MongodbInstitution[] = [{
        _id: null,
        name: 'institution 0', 
        type: 'PERSONAL_BANK', 
        imageUrl: 'url 0', 
        primaryColor: 'color 0',
        providerConnectorId: 'connector 0'
    }]

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')

        const institutionCollection = MongoHelper.getCollection('institutions')
        await institutionCollection.insertMany(institutionsArray)

        validInstitution = (await institutionRepo.fetchByType('PERSONAL_BANK'))[0]

        validUser = await userRepo.add({
            name: "valid name",
            email: "valid@email.com",
            password: "valid"
        })
    })

    afterAll(async () => {
        await MongoHelper.clearCollection('users')
        await MongoHelper.clearCollection('institutions')
        await MongoHelper.clearCollection('accounts')
        await MongoHelper.disconnect()
    })

    test('should create a manual bank account for a valid user', async () => {
        await request(app)
            .post('/api/create/manual-bank')
            .send({
                type: 'BANK',
                name: 'valid name',
                balance: 897,
                imageUrl: 'url',
                userId: validUser.id,
                institution: validInstitution,
            })
            .expect(201)
            .then((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.type).toBe('BANK')
                expect(res.body.institution.id).toBeTruthy()
            })
    })
    
    test('should create a manual bank account without institution for a valid user', async () => {
        await request(app)
            .post('/api/create/manual-bank')
            .send({
                type: 'BANK',
                name: 'valid name',
                balance: 897,
                imageUrl: 'url',
                userId: validUser.id,
            })
            .expect(201)
            .then((res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.type).toBe('BANK')
                expect(res.body.institution).toBeNull()
            })
    })
})