import { Email } from "@/entities"
import { InvalidEmailError } from "@/entities/errors"

describe("Email value object", () => {
    test("should not accept empty strings", () => {
        const invalidEmail = ''
        const email = Email.create(invalidEmail).value as Error
        expect(email).toBeInstanceOf(InvalidEmailError)
        // expect(email.message).toBe('Email required')
    })

    test("should accept valid email", () => {
        const validEmail = 'valid@email.com'
        const email = Email.create(validEmail).value as Email
        expect(email.value).toBe(validEmail)
    })

    test("should not accept email without an at-sign", () => {
        const invalidEmail = 'invalidemail.com'
        const email = Email.create(invalidEmail).value as Error
        expect(email).toBeInstanceOf(InvalidEmailError)
    })

    test("should not accept email with invalid char", () => {
        const invalidEmail = 'in valid@email.com'
        const email = Email.create(invalidEmail).value as Error
        expect(email).toBeInstanceOf(InvalidEmailError)
    })

    test("should not accept empty local part", () => {
        const invalidEmail = '@email.com'
        const email = Email.create(invalidEmail).value as Error
        expect(email).toBeInstanceOf(InvalidEmailError)
    })

    test("should not accept empty domain", () => {
        const invalidEmail = 'anymail@'
        const email = Email.create(invalidEmail).value as Error
        expect(email).toBeInstanceOf(InvalidEmailError)
    })
})