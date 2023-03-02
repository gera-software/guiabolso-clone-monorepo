import { CreditCardAccount, Institution, User } from "@/entities"
import { InvalidBalanceError, InvalidCreditCardError, InvalidNameError } from "@/entities/errors"

describe("Credit Card Account entity", () => {
    test("should not create an account with empty name", () => {
        const name = ''
        const balance = 0
        const imageUrl = 'valid image url'
        const creditCardInfo = {
            brand: 'Master Card',
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10,
        }
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

        const error = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as Error
        expect(error).toBeInstanceOf(InvalidNameError)
    })

    test("should not create an account with not integer balance", () => {
        const name = 'valid name'
        const balance = 4.6
        const imageUrl = 'valid image url'
        const creditCardInfo = {
            brand: 'Master Card',
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10,
        }
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

        const error = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as Error
        expect(error).toBeInstanceOf(InvalidBalanceError)
    })

    test("should not create an account with invalid credit card info", () => {
        const name = 'valid name'
        const balance = 47
        const imageUrl = 'valid image url'
        const creditCardInfo = {
            brand: '',
            creditLimit: 1000.40,
            availableCreditLimit: 500.34,
            closeDay: 0,
            dueDay: 32,
        }
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

        const error = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as Error
        expect(error).toBeInstanceOf(InvalidCreditCardError)
        expect(error.message).toBe('Invalid credit card params: brand, closeDay, dueDay, creditLimit, availableCreditLimit')
    })

    test("should create an account with valid params", () => {
        const name = 'valid name'
        const balance = 300
        const imageUrl = 'valid image url'
        const creditCardInfo = {
            brand: 'Master Card',
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10,
        }
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

        const account = CreditCardAccount.create({name, balance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
        expect(account.type).toBe('CREDIT_CARD')
        expect(account.name).toBe(name)
        expect(account.balance.value).toBe(balance)
        expect(account.imageUrl).toBe(imageUrl)
        expect(account.user.name).toBe(user.name)
        expect(account.user.email).toBe(user.email)
        expect(account.institution.id).toEqual(institution.id)
        expect(account.creditCardInfo.brand).toEqual(creditCardInfo.brand)
        expect(account.creditCardInfo.creditLimit.value).toEqual(creditCardInfo.creditLimit)
        expect(account.creditCardInfo.availableCreditLimit.value).toEqual(creditCardInfo.availableCreditLimit)
        expect(account.creditCardInfo.closeDay).toEqual(creditCardInfo.closeDay)
        expect(account.creditCardInfo.dueDay).toEqual(creditCardInfo.dueDay)
    })

    test("should create an account without institution", () => {
        const name = 'valid name'
        const balance = 300
        const imageUrl = 'valid image url'
        const creditCardInfo = {
            brand: 'Master Card',
            creditLimit: 100000,
            availableCreditLimit: 50000,
            closeDay: 3,
            dueDay: 10,
        }
        const user = User.create({
            name: 'user name',
            email: 'user@email.com',
            password: 'user password',
        }).value as User

        const account = CreditCardAccount.create({name, balance, imageUrl, user, creditCardInfo}).value as CreditCardAccount
        expect(account.type).toBe('CREDIT_CARD')
        expect(account.name).toBe(name)
        expect(account.balance.value).toBe(balance)
        expect(account.imageUrl).toBe(imageUrl)
        expect(account.user.name).toBe(user.name)
        expect(account.user.email).toBe(user.email)
        expect(account.institution).toBeFalsy()
        expect(account.creditCardInfo.brand).toEqual(creditCardInfo.brand)
        expect(account.creditCardInfo.creditLimit.value).toEqual(creditCardInfo.creditLimit)
        expect(account.creditCardInfo.availableCreditLimit.value).toEqual(creditCardInfo.availableCreditLimit)
        expect(account.creditCardInfo.closeDay).toEqual(creditCardInfo.closeDay)
        expect(account.creditCardInfo.dueDay).toEqual(creditCardInfo.dueDay)
    })
})