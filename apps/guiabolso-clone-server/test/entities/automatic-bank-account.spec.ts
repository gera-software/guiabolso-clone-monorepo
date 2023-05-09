import { AutomaticBankAccount, Institution, User } from "@/entities"
import { InvalidAccountError, InvalidBalanceError, InvalidInstitutionError, InvalidNameError } from "@/entities/errors"

describe("Automatic Bank Account entity", () => {
    describe('create', () => {
        test("should not create an account with empty name", () => {
            const name = ''
            const balance = 5678
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
    
            const error = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as Error
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
    
            const error = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as Error
            expect(error).toBeInstanceOf(InvalidBalanceError)
        })

        test("should not create an account without institution", () => {
            const name = 'valid name'
            const balance =5678
            const imageUrl = 'valid image url'
            const user = User.create({
                name: 'user name',
                email: 'user@email.com',
                password: 'user password',
            }).value as User
            const institution: Institution = null
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
    
            const error = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as Error
            expect(error).toBeInstanceOf(InvalidInstitutionError)
        })

        test("should not create an account without providerAccountId", () => {
            const name = 'valid name'
            const balance = 5678
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
            const providerAccountId = ''
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
    
            const error = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('providerAccountId is required')
        })

        test("should not create an account without providerItemId", () => {
            const name = 'valid name'
            const balance = 5678
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = ''
            const createdAt = new Date()
    
            const error = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('providerItemId is required')
        })

        test("should not create an account without createdAt", () => {
            const name = 'valid name'
            const balance = 5678
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt: Date = null
    
            const error = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as Error
            expect(error).toBeInstanceOf(InvalidAccountError)
            expect(error.message).toBe('createdAt is required')
        })

        test("should create an account with valid params", () => {
            const name = 'valid name'
            const balance = 5678
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
            const providerAccountId = 'valid-account-id'
            const providerItemId = 'valid-item-id'
            const createdAt = new Date()
    
            const account = AutomaticBankAccount.create({ name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt }).value as AutomaticBankAccount
            expect(account.type).toBe('BANK')
            expect(account.name).toBe(name)
            expect(account.balance.value).toBe(balance)
            expect(account.imageUrl).toBe(imageUrl)
            expect(account.user.name).toBe(user.name)
            expect(account.user.email).toBe(user.email)
            expect(account.institution.id).toEqual(institution.id)
            expect(account.syncType).toEqual('AUTOMATIC')
            expect(account.providerAccountId).toEqual(providerAccountId)
            expect(account.synchronization.providerItemId).toEqual(providerItemId)
            expect(account.synchronization.createdAt).toEqual(createdAt)
        })
    })
})