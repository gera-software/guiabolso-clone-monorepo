import { Password } from "@/entities"
import { InvalidPasswordError } from "@/entities/errors"

describe("Password value object", () => {
    test("should not accept empty string", () => {
        const invalidPassword = ''
        const password = Password.create(invalidPassword).value as Error
        expect(password).toBeInstanceOf(InvalidPasswordError)
        expect(password.message).toBe("Password can't be empty")
    })
})