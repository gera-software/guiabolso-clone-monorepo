
import { InvalidNameError } from "@/entities/errors"
import { User } from "@/entities/user"

describe('User domain entity', () => {
    test('should not create user with empty name', () => {
        const invalidName = ""
        const error = User.create({name: invalidName, email: 'any_email'}).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
        expect(error.message).toEqual('Invalid name: .')
    })
})