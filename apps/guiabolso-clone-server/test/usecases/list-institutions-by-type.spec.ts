import { Institution, InstitutionType } from "@/entities"
import { InvalidTypeError } from "@/entities/errors"
import { ListInstitutionsByType } from "@/usecases/list-institutions-by-type"
import { InstitutionData, InstitutionRepository } from "@/usecases/ports"
import { InMemoryInstitutionRepository } from "@test/doubles/repositories"

describe('List institutions by type use case', () => {
    const institutionsArray: InstitutionData[] = []
    institutionsArray.push({
        id: '0', 
        name: 'institution 0', 
        type: 'PERSONAL_BANK', 
        imageUrl: 'url 0', 
        primaryColor: 'color 0',
        providerConnectorId: 'connector 0'
    })
    institutionsArray.push({
        id: '1', 
        name: 'institution 1', 
        type: 'BUSINESS_BANK', 
        imageUrl: 'url 1', 
        primaryColor: 'color 1',
        providerConnectorId: 'connector 1'
    })
    institutionsArray.push({
        id: '2', 
        name: 'institution 2', 
        type: 'INVESTMENT', 
        imageUrl: 'url 2', 
        primaryColor: 'color 2',
        providerConnectorId: 'connector 2'
    })

    test('should not list institutions if type is null', async () => {
        const institutionRepo: InstitutionRepository = new InMemoryInstitutionRepository(institutionsArray)
        const sut = new ListInstitutionsByType(institutionRepo)
        const type: InstitutionType = null
        const error = (await sut.perform(type)).value as Error
        expect(error).toBeInstanceOf(InvalidTypeError)
    })

    test('should not list institutions if type is invalid', async () => {
        const institutionRepo: InstitutionRepository = new InMemoryInstitutionRepository(institutionsArray)
        const sut = new ListInstitutionsByType(institutionRepo)
        const type = 'invalid'
        const error = (await sut.perform(type)).value as Error
        expect(error).toBeInstanceOf(InvalidTypeError)
    })

    test('should list institutions of type PERSONAL_BANK', async () => {
        const institutionRepo: InstitutionRepository = new InMemoryInstitutionRepository(institutionsArray)
        const sut = new ListInstitutionsByType(institutionRepo)
        const type = "PERSONAL_BANK"
        const response = (await sut.perform(type)).value as InstitutionData[]
        expect(response.length).toBe(1)
    })
})