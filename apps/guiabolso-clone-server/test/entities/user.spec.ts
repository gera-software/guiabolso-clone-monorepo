
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { User } from "@/entities"

describe('User domain entity', () => {
    test('should not create user with empty name', () => {
        const invalidName = ""
        const error = User.create({name: invalidName, email: 'any_email', password: '123abc'}).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
    })

    test('should not create user with invalid email', () => {
        const invalidEmail = ""
        const error = User.create({name: 'any_name', email: invalidEmail, password: '123abc'}).value as Error
        expect(error).toBeInstanceOf(InvalidEmailError)
    })

    test('should not create user with invalid password', () => {
        const invalidPassword = ""
        const error = User.create({name: 'any_name', email: 'any@mail.com', password: invalidPassword}).value as Error
        expect(error).toBeInstanceOf(InvalidPasswordError)
    })

    test('should create user with valid data', () => {
        const user = User.create({name: 'any_name', email: 'any@email.com', password: '123abc', isVerified: true}).value as User
        expect(user.name).toEqual('any_name')
        expect(user.email.value).toEqual('any@email.com')
        expect(user.password.value).toEqual('123abc')
        expect(user.isVerified).toEqual(true)
    })
})