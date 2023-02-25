
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

    test('should create user with valid data', () => {
        const user = User.create({name: 'any_name', email: 'any@email.com'}).value as User
        expect(user.name).toEqual('any_name')
        expect(user.email).toEqual('any@email.com')
    })
})