import { BankAccount, Institution, User } from "@/entities"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"

describe("Bank Account entity", () => {
    test("should not create an account with empty name", () => {
        const name = ''
        const balance = 0
        const imageUrl = 'valid image url'
        const user = User.create({
            name: 'user name',
            email: 'user@email.com',
            password: 'user password',
        }).value as User
        const institution = Institution.create({
            id: 'valid id', 
            name: 'valid name', 
            type: "PERSONAL_BANK", 
            imageUrl: 'valid url', 
            primaryColor: 'valid color', 
            providerConnectorId: 'valid id'
        }).value as Institution

        const error = BankAccount.create({name, balance, imageUrl, user, institution}).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
    })

    test("should not create an account with not integer balance", () => {
        const name = 'valid name'
        const balance = 4.6
        const imageUrl = 'valid image url'
        const user = User.create({
            name: 'user name',
            email: 'user@email.com',
            password: 'user password',
        }).value as User
        const institution = Institution.create({
            id: 'valid id', 
            name: 'valid name', 
            type: "PERSONAL_BANK", 
            imageUrl: 'valid url', 
            primaryColor: 'valid color', 
            providerConnectorId: 'valid id'
        }).value as Institution

        const error = BankAccount.create({name, balance, imageUrl, user, institution}).value as Error
        expect(error).toBeInstanceOf(InvalidBalanceError)
    })

    test("should create an account with valid params", () => {
        const name = 'valid name'
        const balance = 300
        const imageUrl = 'valid image url'
        const user = User.create({
            name: 'user name',
            email: 'user@email.com',
            password: 'user password',
        }).value as User
        const institution = Institution.create({
            id: 'valid id', 
            name: 'valid name', 
            type: "PERSONAL_BANK", 
            imageUrl: 'valid url', 
            primaryColor: 'valid color', 
            providerConnectorId: 'valid id'
        }).value as Institution

        const account = BankAccount.create({name, balance, imageUrl, user, institution}).value as BankAccount
        expect(account.name).toBe(name)
        expect(account.balance.value).toBe(balance)
        expect(account.imageUrl).toBe(imageUrl)
        expect(account.user.name).toBe(user.name)
        expect(account.user.email).toBe(user.email)
        expect(account.institution.id).toEqual(institution.id)
    })

    test("should create an account without institution", () => {
        const name = 'valid name'
        const balance = 300
        const imageUrl = 'valid image url'
        const user = User.create({
            name: 'user name',
            email: 'user@email.com',
            password: 'user password',
        }).value as User

        const account = BankAccount.create({name, balance, imageUrl, user}).value as BankAccount
        expect(account.name).toBe(name)
        expect(account.balance.value).toBe(balance)
        expect(account.imageUrl).toBe(imageUrl)
        expect(account.user.name).toBe(user.name)
        expect(account.user.email).toBe(user.email)
        expect(account.institution).toBeUndefined()
    })
})