import { Email } from "@/entities"
import { InvalidEmailError } from "@/entities/errors"

describe("Email value object", () => {
    test("should not accept empty strings", () => {
        const invalidEmail = ''
        const email = Email.create(invalidEmail).value as Error
        expect(email).toBeInstanceOf(InvalidEmailError)
    })
})