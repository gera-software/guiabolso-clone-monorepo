
import { InvalidEmailError, InvalidNameError } from "@/entities/errors"
import { User } from "@/entities/user"

describe('User domain entity', () => {
    test('should not create user with empty name', () => {
        const invalidName = ""
        const error = User.create({name: invalidName, email: 'any_email'}).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
        expect(error.message).toEqual('Invalid name: .')
    })

    test('should not create user with empty email', () => {
        const invalidEmail = ""
        const error = User.create({name: 'any_name', email: invalidEmail}).value as Error
        expect(error).toBeInstanceOf(InvalidEmailError)
        expect(error.message).toEqual('Invalid email: .')
    })
})