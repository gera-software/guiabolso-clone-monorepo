import { MongodbInstitution, MongodbInstitutionRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { InstitutionData } from "@/usecases/ports"

describe('Mongodb Institution repository', () => {
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
    
    beforeEach(async () => {
        // await MongoHelper.clearCollection('institutions')
    })

    test('when an institution is not find by id, should return null', async () => {
        const notFoundId = '62f95f4a93d61d8fff971668'
        const sut = new MongodbInstitutionRepository()
        const result = await sut.findById(notFoundId)
        expect(result).toBeNull()
    })

    test('when an institution is find by id, should return the institution', async () => {
        const sut = new MongodbInstitutionRepository()
        const result = await sut.findById(institutionsArray[0]._id.toString()) as InstitutionData
        expect(result).not.toBeNull()
        expect(result.id).toBe(institutionsArray[0]._id.toString())
        expect(result.name).toBe(institutionsArray[0].name)
        expect(result.type).toBe(institutionsArray[0].type)
        expect(result.imageUrl).toBe(institutionsArray[0].imageUrl)
        expect(result.primaryColor).toBe(institutionsArray[0].primaryColor)
        expect(result.providerConnectorId).toBe(institutionsArray[0].providerConnectorId)
    })

    test('when an institution exists, should return true', async () => {
        const sut = new MongodbInstitutionRepository()
        const result = await sut.exists(institutionsArray[0]._id.toString())
        expect(result).toBeTruthy()
    })

    test('should list institutions by type', async () => {
        const sut = new MongodbInstitutionRepository()
        const result = await sut.fetchByType('PERSONAL_BANK')
        expect(result.length).toBe(1)
    })

    describe('findByProviderConnectorIdAndUpdate', () => {
        test('if found institution by provider connector id, should updated it', async () => {
            const sut = new MongodbInstitutionRepository()

            const updatedName = 'institution 1 updated'
            const updatedType = 'PERSONAL_BANK'
            const updatedImage = 'url 1 updated'
            const updatedColor = 'color 1 updated'
            const providerConnectorId = 'connector 1'

            const institution: InstitutionData = {
                id: null,
                name: updatedName, 
                type: updatedType, 
                imageUrl: updatedImage, 
                primaryColor: updatedColor,
                providerConnectorId,
            }

            const result = await sut.findByProviderConnectorIdAndUpdate(institution)
            expect(result.id).toBe(institutionsArray[1]._id.toString())
            expect(result.name).toBe(updatedName)
            expect(result.type).toBe(updatedType)
            expect(result.imageUrl).toBe(updatedImage)
            expect(result.primaryColor).toBe(updatedColor)
            expect(result.providerConnectorId).toBe(providerConnectorId)
        })

        test('if not found institution by provider connector id, should create it', async () => {
            const sut = new MongodbInstitutionRepository()

            const updatedName = 'new institution'
            const updatedType = 'PERSONAL_BANK'
            const updatedImage = 'new url'
            const updatedColor = 'new color'
            const providerConnectorId = 'new connector'

            const institution: InstitutionData = {
                id: null,
                name: updatedName, 
                type: updatedType, 
                imageUrl: updatedImage, 
                primaryColor: updatedColor,
                providerConnectorId,
            }

            const result = await sut.findByProviderConnectorIdAndUpdate(institution)
            expect(result.id).toBeDefined()
            expect(result.name).toBe(updatedName)
            expect(result.type).toBe(updatedType)
            expect(result.imageUrl).toBe(updatedImage)
            expect(result.primaryColor).toBe(updatedColor)
            expect(result.providerConnectorId).toBe(providerConnectorId)
        })


    })

})