import { Institution, InstitutionType } from "@/entities"
import { InvalidNameError, InvalidTypeError } from "@/entities/errors"

describe("Institution entity", () => {
    test("should not create an institution with empty name", () => {
        const id = 'valid id'
        const name = ''
        const type = "PERSONAL_BANK"
        const error = Institution.create({id, name, type}).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
    })

    test("should not create an institution with empty type", () => {
        const id = 'valid id'
        const name = 'valid name'
        const error = Institution.create({id, name, type: null}).value as Error
        expect(error).toBeInstanceOf(InvalidTypeError)
    })

    test("should not create an institution with invalid type", () => {
        const id = 'valid id'
        const name = 'valid name'
        const type = "invalid"
        const error = Institution.create({id, name, type}).value as Error
        expect(error).toBeInstanceOf(InvalidTypeError)
    })

    test("should create an institution with valid data", () => {
        const id = 'valid id'
        const name = 'valid name'
        const type = "PERSONAL_BANK"
        const imageUrl = 'valid url'
        const primaryColor = 'valid color'
        const providerConnectorId = 'valid id'

        const institutionData = {id, name, type, imageUrl, primaryColor, providerConnectorId }

        const institution = Institution.create(institutionData).value as Institution
        expect(institution).toEqual(institutionData)
    })
})